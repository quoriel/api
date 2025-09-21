const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getHeaders",
    description: "Returns all request headers",
    version: "1.3.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        const headers = {};
        request.forEach((key, value) => {
            headers[key] = value;
        });
        return this.successJSON(headers);
    }
});