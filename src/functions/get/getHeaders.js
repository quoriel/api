const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getHeaders",
    description: "Returns all request headers",
    version: "1.5.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        const headers = {};
        ctx.runtime.extras.request.forEach((key, value) => {
            headers[key] = value;
        });
        return this.successJSON(headers);
    }
});