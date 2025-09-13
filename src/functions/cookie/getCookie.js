const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getCookie",
    description: "Get a cookie value from the request",
    version: "1.1.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [name]) {
        const { request } = ctx.runtime.extras;
        const header = request.getHeader("cookie");
        if (!header) {
            return this.success();
        }
        const cookies = header.split(";").reduce((acc, cookie) => {
            const [key, ...rest] = cookie.trim().split("=");
            acc[key] = decodeURIComponent(rest.join("=") || "");
            return acc;
        }, {});
        return this.success(cookies[name]);
    }
});