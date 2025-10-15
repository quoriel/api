const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getQuery",
    description: "Get a query parameter value from the URL",
    version: "1.5.0",
    output: ArgType.Unknown,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Query parameter key",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [key]) {
        return this.success(ctx.runtime.extras.request.getQuery(key));
    }
});