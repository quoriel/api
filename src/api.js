const uWS = require("uWebSockets.js");
const { Interpreter, Compiler, Logger } = require("@tryforge/forgescript");
const { readdirSync, existsSync } = require("fs");
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
        hosts: [],
        ips: [],
        headers: {}
    }
};

function initializer(options = {}, client) {
    state.path = options.path ? join(process.cwd(), options.path) : null;
    if (!state.path) return;
    state.client = client;
    state.ssl = options.ssl || {};
    state.port = +options.port || 3000;
    state.allowed = {
        hosts: options.allowed?.hosts || [],
        ips: options.allowed?.ips || [],
        headers: options.allowed?.headers || {}
    };
    state.app = createApp();
    loadRoutes();
    startServer();
}

function updateRoutes() {
    if (!state.path) return;
    if (state.socket) {
        uWS.us_listen_socket_close(state.socket);
        state.socket = null;
    }
    state.app = createApp();
    loadRoutes();
    startServer();
}

function createApp() {
    return Object.keys(state.ssl).length ? uWS.SSLApp(state.ssl) : uWS.App();
}

function loadRoutes() {
    const files = scanRoutes(state.path);
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

function scanRoutes(path) {
    if (!existsSync(path)) return [];
    const results = [];
    const files = readdirSync(path, { withFileTypes: true });
    for (const file of files) {
        const fullPath = join(path, file.name);
        if (file.isDirectory()) {
            results.push(...scanRoutes(fullPath));
        } else if (file.name.endsWith(".js")) {
            results.push(fullPath);
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
    if (!["GET", "HEAD", "TRACE", "DELETE", "OPTIONS", "PATCH", "PUT", "POST"].includes(route.method)) {
        return false;
    }
    return true;
}

function registerRoute(route) {
    const url = route.url.startsWith("/") ? route.url : "/" + route.url;
    const method = route.method.toLowerCase().replace("delete", "del");
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
            Logger.error(error);
            response.end("Internal Server Error");
        }
    };
    let allowed = { hosts: [], ips: [], headers: {} };
    if (route.allowed !== false) {
        if (route.allowed === undefined || route.allowed === true) {
            allowed = state.allowed;
        } else if (route.allowed?.merge) {
            allowed = {
                hosts: { ...state.allowed.hosts, ...(route.allowed?.hosts || []) },
                ips: { ...state.allowed.ips, ...(route.allowed?.ips || []) },
                headers: { ...state.allowed.headers, ...(route.allowed?.headers || {}) }
            };
        } else {
            allowed = {
                hosts: route.allowed?.hosts || [],
                ips: route.allowed?.ips || [],
                headers: route.allowed?.headers || {}
            };
        }
    }
    if (Object.keys(allowed.headers).length > 0) {
        handler = allowedHeaders(handler, allowed.headers);
    }
    if (allowed.ips.length > 0) {
        handler = allowedIPs(handler, allowed.ips);
    }
    if (allowed.hosts.length > 0) {
        handler = allowedHosts(handler, allowed.hosts);
    }
    state.app[method](url, handler);
}

function allowedHosts(handler, hosts) {
    return (response, request) => {
        if (!hosts.includes(request.getHeader("host"))) {
            response.end("Access denied");
            return;
        }
        handler(response, request);
    };
}

function allowedIPs(handler, ips) {
    return (response, request) => {
        if (!ips.includes(convertIP(response.getRemoteAddress()))) {
            response.end("Access denied");
            return;
        }
        handler(response, request);
    };
}

function allowedHeaders(handler, headers) {
    return (response, request) => {
        for (const [name, value] of Object.entries(headers)) {
            const actual = request.getHeader(name.toLowerCase());
            if (actual !== value) {
                response.end("Access denied");
                return;
            }
        }
        handler(response, request);
    };
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