const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { convertIP } = require("../../convert");

exports.default = new NativeFunction({
    name: "$getIP",
    description: "Gets the client's IP address",
    version: "1.5.0",
    output: ArgType.String,
    unwrap: false,
    execute(ctx) {
        return this.success(convertIP(ctx.runtime.extras.response.getRemoteAddress()));
    }
});