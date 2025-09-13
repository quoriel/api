const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getCookies",
    description: "Get all cookies from the request",
    version: "1.1.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        const { request } = ctx.runtime.extras;
        const header = request.getHeader("cookie");
        if (!header) {
            return this.successJSON({});
        }
        const cookies = header.split(";").reduce((acc, cookie) => {
            const [key, ...rest] = cookie.trim().split("=");
            if (key && rest.length > 0) {
                acc[key] = decodeURIComponent(rest.join("="));
            }
            return acc;
        }, {});
        return this.successJSON(cookies);
    }
});