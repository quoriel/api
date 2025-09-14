const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$sendJsonp",
    description: "Send JSONP response",
    version: "1.2.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "json",
            description: "JSON data to send",
            type: ArgType.Json,
            required: true,
            rest: false
        },
        {
            name: "callback",
            description: "Callback function name",
            type: ArgType.String,
            required: false,
            rest: false
        }
    ],
    execute(ctx, [json, callback]) {
        const { response, request } = ctx.runtime.extras;
        const query = request.getQuery();
        const params = Object.fromEntries(new URLSearchParams(query));
        const method = callback || params["callback"] || "callback";
        response.writeHeader("Content-Type", "application/javascript");
        response.end(`${method}(${JSON.stringify(json)})`);
        return this.success();
    }
});