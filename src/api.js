const uWS = require("uWebSockets.js");
const { Interpreter, Compiler, Logger } = require("@tryforge/forgescript");
const { readdir, access } = require("fs").promises;
const { convertIP } = require("./convert");
const { join } = require("path");

const state = {
    app: null,
    client: null,
    port: null,
    path: null,
    socket: null,
    ssl: {},
    allowed: {
        hosts: new Set(),
        ips: new Set(),
        headers: new Map()
    }
};

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

async function initializer(options = {}, client) {
    state.path = options.path ? join(process.cwd(), options.path) : null;
    if (!state.path) return;
    state.client = client;
    state.ssl = options.ssl || {};
    state.port = +options.port || 3000;
    state.allowed = {
        hosts: new Set(options.allowed?.hosts || []),
        ips: new Set(options.allowed?.ips || []),
        headers: new Map(Object.entries(options.allowed?.headers || {}))
    };
    await updateRoutes();
}

async function updateRoutes() {
    if (!state.path) return;
    if (state.socket) {
        uWS.us_listen_socket_close(state.socket);
        state.socket = null;
    }
    state.app = Object.keys(state.ssl).length ? uWS.SSLApp(state.ssl) : uWS.App();
    await loadRoutes();
    startServer();
}

async function loadRoutes() {
    const files = await scanRoutes(state.path);
    for (const file of files) {
        try {
            const modules = require(file);
            delete require.cache[require.resolve(file)];
            const array = Array.isArray(modules) ? modules : [modules];
            for (const module of array) {
                if (validateRoute(module)) {
                    registerRoute(module);
                }
            }
        } catch (error) {
            Logger.error(`Error loading route from ${file}:`, error);
        }
    }
}

async function scanRoutes(path) {
    try {
        await access(path);
    } catch {
        return [];
    }
    const results = [];
    const files = await readdir(path, { withFileTypes: true });
    for (const file of files) {
        const full = join(path, file.name);
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
    if (!route || typeof route !== "object") {
        return false;
    }
    if (typeof route.url !== "string" || typeof route.method !== "string" || typeof route.code !== "string") {
        return false;
    }
    if (!Object.hasOwn(methods, route.method)) {
        return false;
    }
    return true;
}

function registerRoute(route) {
    const url = route.url.startsWith("/") ? route.url : "/" + route.url;
    const code = Compiler.compile(route.code);
    let handler = async (response, request) => {
        response.onAborted(() => {});
        try {
            await Interpreter.run({
                client: state.client,
                data: code,
                extras: { response, request }
            });
        } catch (error) {
            response.end("Internal Server Error");
            Logger.error(error);
        }
    };
    let allowed = { hosts: new Set(), ips: new Set(), headers: new Map() };
    if (route.allowed !== false) {
        if (route.allowed === undefined || route.allowed === true) {
            allowed = state.allowed;
        } else if (route.allowed?.merge) {
            allowed = {
                hosts: new Set([...state.allowed.hosts, ...(route.allowed.hosts || [])]),
                ips: new Set([...state.allowed.ips, ...(route.allowed.ips || [])]),
                headers: new Map([...state.allowed.headers, ...Object.entries(route.allowed.headers || {})])
            };
        } else {
            allowed = {
                hosts: new Set(route.allowed.hosts || []),
                ips: new Set(route.allowed.ips || []),
                headers: new Map(Object.entries(route.allowed.headers || {}))
            };
        }
    }
    if (allowed.headers.size > 0) {
        const headers = new Map();
        for (const [name, value] of allowed.headers) {
            headers.set(name.toLowerCase(), value);
        }
        const old = handler;
        handler = (response, request) => {
            for (const [name, value] of headers) {
                if (request.getHeader(name) !== value) {
                    return response.end("Access denied");
                }
            }
            old(response, request);
        };
    }
    if (allowed.ips.size) {
        const ips = allowed.ips;
        const old = handler;
        handler = (response, request) => {
            if (!ips.has(convertIP(response.getRemoteAddress()))) {
                return response.end("Access denied");
            }
            old(response, request);
        };
    }
    if (allowed.hosts.size) {
        const hosts = allowed.hosts;
        const old = handler;
        handler = (response, request) => {
            if (!hosts.has(request.getHeader("host"))) {
                return response.end("Access denied");
            }
            old(response, request);
        };
    }
    state.app[methods[route.method]](url, handler);
}

function startServer() {
    state.app.listen(state.port, socket => {
        if (!socket) {
            Logger.error(`Failed to start server on port ${state.port}`);
            process.exit(1);
        }
        state.socket = socket;
    });
}

module.exports = { initializer, updateRoutes };