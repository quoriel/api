const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$sendText",
    description: "Send a text response",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "text",
            description: "Text data to send",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [text]) {
        const { response } = ctx.runtime.extras;
        response.writeHeader("Content-Type", "text/plain");
        response.end(text);
        return this.success();
    }
});