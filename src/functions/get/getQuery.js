const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getQuery",
    description: "Get a query parameter value from the URL (decoded)",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Query parameter key",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [key]) {
        const { request } = ctx.runtime.extras;
        const value = request.getQuery(key);
        return this.success(value);
    }
});