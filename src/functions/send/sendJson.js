const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$sendJson",
    description: "Send JSON response",
    version: "1.3.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "json",
            description: "JSON data to send",
            type: ArgType.Json,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [json]) {
        const { response } = ctx.runtime.extras;
        response.writeHeader("Content-Type", "application/json").end(JSON.stringify(json));
        return this.success();
    }
});