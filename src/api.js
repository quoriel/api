const uWS = require("uWebSockets.js");
const { Interpreter, Compiler, Logger } = require("@tryforge/forgescript");
const { readdirSync, existsSync } = require("fs");
const { join } = require("path");

const state = {
    app: null,
    client: null,
    port: null,
    path: null,
    socket: null,
    ssl: {}
};

function initializer(options = {}, client) {
    state.path = options.path ? join(process.cwd(), options.path) : null;
    if (!state.path) return;
    state.client = client;
    state.ssl = options.ssl || {};
    state.port = +options.port || 3000;
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
    const handler = async (response, request) => {
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
    state.app[method](url, handler);
}

function startServer() {
    state.app.listen(state.port, (socket) => {
        if (!socket) {
            Logger.error(`Failed to start server on port ${state.port}`);
            process.exit(1);
        }
        state.socket = socket;
    });
}

module.exports = { initializer, updateRoutes };