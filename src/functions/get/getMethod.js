const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getMethod",
    description: "Get the HTTP method of the request",
    version: "1.3.0",
    output: ArgType.Unknown,
    unwrap: false,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        return this.success(request.getMethod());
    }
});