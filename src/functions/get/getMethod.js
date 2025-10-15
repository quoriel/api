const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getMethod",
    description: "Get the HTTP method of the request",
    version: "1.5.0",
    output: ArgType.Unknown,
    unwrap: false,
    execute(ctx) {
        return this.success(ctx.runtime.extras.request.getMethod());
    }
});