const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getMethod",
    description: "Get the HTTP method of the request",
    version: "1.0.0",
    output: ArgType.Unknown,
    unwrap: true,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        const value = request.getMethod();
        return this.success(value);
    }
});