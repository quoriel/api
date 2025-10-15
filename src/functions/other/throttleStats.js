const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { throttleStats } = require("../../throttle");

exports.default = new NativeFunction({
    name: "$throttleStats",
    description: "Returns current throttle statistics",
    version: "1.5.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON(throttleStats());
    }
});