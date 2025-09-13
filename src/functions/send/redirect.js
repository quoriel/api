const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$redirect",
    description: "Redirect to a specified URL",
    version: "1.0.0",
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
        const { response } = ctx.runtime.extras;
        response.writeStatus("302");
        response.writeHeader("Location", url);
        response.end();
        return this.success();
    }
});