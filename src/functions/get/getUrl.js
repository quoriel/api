const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getUrl",
    description: "Get the full URL of the request",
    version: "1.0.0",
    output: ArgType.Unknown,
    unwrap: true,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        const value = request.getUrl();
        return this.success(value);
    }
});