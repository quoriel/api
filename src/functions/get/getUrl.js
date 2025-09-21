const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getUrl",
    description: "Get the full URL of the request",
    version: "1.3.0",
    output: ArgType.Unknown,
    unwrap: false,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        return this.success(request.getUrl());
    }
});