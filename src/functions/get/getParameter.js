const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getParameter",
    description: "Get a URL parameter value by index or name",
    version: "1.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "param",
            description: "Parameter index (number) or name (string)",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [param]) {
        const { request } = ctx.runtime.extras;
        let value;
        const index = parseInt(param);
        if (!isNaN(index)) {
            value = request.getParameter(index);
        } else {
            value = request.getParameter(param);
        }
        return this.success(value);
    }
});