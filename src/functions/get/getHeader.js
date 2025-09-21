const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getHeader",
    description: "Get a header value from the request",
    version: "1.3.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Header key",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [key]) {
        const { request } = ctx.runtime.extras;
        return this.success(request.getHeader(key.toLowerCase()));
    }
});