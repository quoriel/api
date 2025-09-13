const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$writeStatus",
    description: "Set the HTTP status code for the response",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "status",
            description: "Status code and message (e.g., '404 Not Found')",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [status]) {
        const { response } = ctx.runtime.extras;
        response.writeStatus(status);
        return this.success();
    }
});