const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$setCookie",
    description: "Set a cookie in the response",
    version: "1.1.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "Cookie value",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "options",
            description: "Cookie options (JSON: {maxAge, path, domain, secure, httpOnly, sameSite, expires})",
            type: ArgType.Json,
            required: false,
            rest: false
        }
    ],
    execute(ctx, [name, value, options = {}]) {
        const { response } = ctx.runtime.extras;
        let cookie = `${name}=${encodeURIComponent(value)}`;
        if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
        if (options.path) cookie += `; Path=${options.path}`;
        if (options.domain) cookie += `; Domain=${options.domain}`;
        if (options.secure) cookie += `; Secure`;
        if (options.httpOnly) cookie += `; HttpOnly`;
        if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
        if (options.expires) cookie += `; Expires=${new Date(options.expires).toUTCString()}`;
        response.writeHeader('Set-Cookie', cookie);
        return this.success();
    }
});