const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getProxiedIP",
    description: "Gets the client's real IP address through PROXY Protocol (nginx, cloudflare, etc.)",
    version: "1.0.0",
    output: ArgType.Json,
    unwrap: true,
    execute(ctx) {
        const { response } = ctx.runtime.extras;
        const buffer = response.getProxiedRemoteAddress();
        const array = new Uint8Array(buffer);
        let result = {
            address: "unknown",
            version: "unknown",
            raw: Array.from(array)
        };
        if (array.length === 4) {
            result.address = Array.from(array).join('.');
            result.version = "IPv4";
        } else if (array.length === 16) {
            const parts = [];
            for (let i = 0; i < 16; i += 2) {
                const part = (array[i] << 8) | array[i + 1];
                parts.push(part.toString(16));
            }
            result.address = parts.join(':');
            result.version = "IPv6";
        }
        return this.successJSON(result);
    }
});