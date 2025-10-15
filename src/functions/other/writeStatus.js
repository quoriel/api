const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$writeStatus",
    description: "Set the HTTP status code for the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "status",
            description: "Status code (e.g., 200, 404)",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "message",
            description: "Status message",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [status, message]) {
        ctx.runtime.extras.response.writeStatus(message ? status + " " + message : status);
        return this.success();
    }
});