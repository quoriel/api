const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$isSSL",
    description: "Check if connection uses SSL/TLS (based on app type or headers)",
    version: "1.1.0",
    output: ArgType.Boolean,
    unwrap: false,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        const proto = request.getHeader("x-forwarded-proto");
        const isSSL = proto === "https" || ctx.runtime.extras.isSSLApp || false;
        return this.success(isSSL);
    }
});