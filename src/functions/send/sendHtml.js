const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$sendHtml",
    description: "Send HTML response",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "html",
            description: "HTML content to send",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [html]) {
        const { response } = ctx.runtime.extras;
        response.writeHeader("Content-Type", "text/html");
        response.end(html);
        return this.success();
    }
});