const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { convertIP } = require("../../convert");

exports.default = new NativeFunction({
    name: "$getIP",
    description: "Gets the client's IP address",
    version: "1.3.0",
    output: ArgType.String,
    unwrap: false,
    execute(ctx) {
        const { response } = ctx.runtime.extras;
        return this.success(convertIP(response.getRemoteAddress()));
    }
});