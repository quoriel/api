const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$setYield",
    description: "Indicates that the current route handler did not handle the request, allowing the router to continue searching for other matching handlers",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "yield",
            description: "Skip processing",
            type: ArgType.Boolean,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [yield]) {
        const { request } = ctx.runtime.extras;
        request.setYield(yield);
        return this.success();
    }
});