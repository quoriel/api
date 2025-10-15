const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$redirect",
    description: "Redirect to a specified URL",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "URL to redirect to",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [url]) {
        ctx.runtime.extras.response.writeStatus("302").writeHeader("Location", url).end();
        return this.success();
    }
});