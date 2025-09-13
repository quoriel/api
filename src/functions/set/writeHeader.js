const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$writeHeader",
    description: "Set an HTTP header for the response",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Header key",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "Header value",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [key, value]) {
        const { response } = ctx.runtime.extras;
        response.writeHeader(key, value);
        return this.success();
    }
});