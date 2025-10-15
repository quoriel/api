const uWS = require("uWebSockets.js");
const { Interpreter, Compiler, Logger } = require("@tryforge/forgescript");
const { promises: { readdir, access } } = require("fs");
const { cacheIP, convertIP } = require("./convert");
const { setupThrottle, checkThrottle } = require("./throttle");
const { join } = require("path");

let app = null;
let client = null;
let port = 3000;
let path = null;
let socket = null;
let throttle = false;
let ssl = {};
let allowed = {};

const methods = {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "del",
    PATCH: "patch",
    OPTIONS: "options",
    HEAD: "head",
    TRACE: "trace",
    CONNECT: "connect",
    ANY: "any"
};

async function initializer(options = {}, instance) {
    if (options.path) path = join(process.cwd(), options.path);
    if (!path) return;
    if (options.throttle) {
        throttle = true;
        setupThrottle(options.throttle);
    }
    if (options.cacheIP) cacheIP(options.cacheIP);
    if (options.allowed) allowed = options.allowed;
    if (options.ssl) ssl = options.ssl;
    client = instance;
    port = +options.port || 3000;
    await updateRoutes();
}

async function updateRoutes() {
    if (!path) return;
    if (socket) {
        uWS.us_listen_socket_close(socket);
        socket = null;
    }
    app = Object.keys(ssl).length ? uWS.SSLApp(ssl) : uWS.App();
    await loadRoutes();
    startServer();
}

async function loadRoutes() {
    const files = await scanRoutes(path);
    for (const file of files) {
        try {
            const modules = require(file);
            delete require.cache[require.resolve(file)];
            const array = Array.isArray(modules) ? modules : [modules];
            for (const module of array) {
                if (validateRoute(module)) registerRoute(module);
            }
        } catch (error) {
            Logger.error(`Error loading route from ${file}:`, error);
        }
    }
}

async function scanRoutes(poth) {
    try {
        await access(poth);
    } catch {
        return [];
    }
    const results = [];
    const files = await readdir(poth, { withFileTypes: true });
    for (const file of files) {
        const full = join(poth, file.name);
        if (file.isDirectory()) {
            const sub = await scanRoutes(full);
            results.push(...sub);
        } else if (file.name.endsWith(".js")) {
            results.push(full);
        }
    }
    return results;
}

function validateRoute(route) {
    if (!route || typeof route !== "object") return false;
    if (typeof route.url !== "string" || typeof route.method !== "string" || typeof route.code !== "string") return false;
    if (!Object.hasOwn(methods, route.method)) return false;
    return true;
}

function registerRoute(route) {
    const url = route.url.startsWith("/") ? route.url : "/" + route.url;
    const code = Compiler.compile(route.code);
    let handler = async (response, request) => {
        response.onAborted(() => {});
        try {
            await Interpreter.run({ obj: {}, client, data: code, extras: { response, request } });
        } catch (error) {
            response.end("Internal Server Error");
            Logger.error(error);
        }
    };
    let allowedHosts = new Set();
    let whiteIps = new Set();
    let blackIps = new Set();
    let allowedHeaders = new Map();
    if (route.allowed !== false) {
        if (!route.allowed || route.allowed === true) {
            allowedHosts = new Set(allowed.hosts || []);
            whiteIps = new Set(allowed.ips?.white || []);
            blackIps = new Set(allowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(allowed.headers || {}));
        } else if (route.allowed?.merge) {
            allowedHosts = new Set([...(allowed.hosts || []), ...(route.allowed.hosts || [])]);
            whiteIps = new Set([...(allowed.ips?.white || []), ...(route.allowed.ips?.white || [])]);
            blackIps = new Set([...(allowed.ips?.black || []), ...(route.allowed.ips?.black || [])]);
            allowedHeaders = new Map([...Object.entries(allowed.headers || {}), ...Object.entries(route.allowed.headers || {})]);
        } else {
            allowedHosts = new Set(route.allowed.hosts || []);
            whiteIps = new Set(route.allowed.ips?.white || []);
            blackIps = new Set(route.allowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(route.allowed.headers || {}));
        }
    }
    if (allowedHeaders.size) {
        const headers = new Map();
        for (const entry of allowedHeaders) headers.set(entry[0].toLowerCase(), entry[1]);
        const old = handler;
        handler = (response, request) => {
            for (const entry of headers) if (request.getHeader(entry[0]) !== entry[1]) return response.end("Access denied");
            old(response, request);
        };
    }
    if (allowedHosts.size) {
        const old = handler;
        handler = (response, request) => {
            if (!allowedHosts.has(request.getHeader("host"))) return response.end("Access denied");
            old(response, request);
        };
    }
    if (whiteIps.size) {
        const old = handler;
        handler = (response, request) => {
            if (!whiteIps.has(convertIP(response.getRemoteAddress()))) return response.end("Access denied");
            old(response, request);
        };
    }
    if (blackIps.size) {
        const old = handler;
        handler = (response, request) => {
            if (blackIps.has(convertIP(response.getRemoteAddress()))) return response.end("Access denied");
            old(response, request);
        };
    }
    if (throttle && route.throttle !== false) {
        const old = handler;
        handler = (response, request) => {
            if (checkThrottle(convertIP(response.getRemoteAddress()))) return response.end("Access denied");
            old(response, request);
        };
    }
    app[methods[route.method]](url, handler);
}

function startServer() {
    app.listen(port, listen => {
        if (!listen) {
            Logger.error(`Failed to start server on port ${port}`);
            process.exit(1);
        }
        socket = listen;
    });
}

module.exports = { initializer, updateRoutes };