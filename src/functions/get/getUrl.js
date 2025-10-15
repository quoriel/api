const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getUrl",
    description: "Get the full URL of the request",
    version: "1.5.0",
    output: ArgType.Unknown,
    unwrap: false,
    execute(ctx) {
        return this.success(ctx.runtime.extras.request.getUrl());
    }
});