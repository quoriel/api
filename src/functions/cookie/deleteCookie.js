const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$deleteCookie",
    description: "Delete a cookie by setting it to expire",
    version: "1.1.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name to delete",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "path",
            description: "Cookie path (should match original)",
            type: ArgType.String,
            required: false,
            rest: false
        },
        {
            name: "domain",
            description: "Cookie domain (should match original)",
            type: ArgType.String,
            required: false,
            rest: false
        }
    ],
    execute(ctx, [name, path, domain]) {
        const { response } = ctx.runtime.extras;
        let cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (path) cookie += `; Path=${path}`;
        if (domain) cookie += `; Domain=${domain}`;
        response.writeHeader("Set-Cookie", cookie);
        return this.success();
    }
});