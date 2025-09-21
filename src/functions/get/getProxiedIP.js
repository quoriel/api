const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { convertIP } = require("../../convert");

exports.default = new NativeFunction({
    name: "$getProxiedIP",
    description: "Gets the client's proxied IP address",
    version: "1.3.0",
    output: ArgType.String,
    unwrap: false,
    execute(ctx) {
        const { response } = ctx.runtime.extras;
        return this.success(convertIP(response.getProxiedRemoteAddress()));
    }
});