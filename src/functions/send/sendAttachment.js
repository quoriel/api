const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { streamFile } = require("../../file");
const { basename } = require("path");

exports.default = new NativeFunction({
    name: "$sendAttachment",
    description: "Send a file as a downloadable attachment",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Path to the file",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Custom filename",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [path, name]) {
        await streamFile(ctx.runtime.extras.response, path, {
            "Content-Disposition": `attachment; filename="${name || basename(path)}"`,
            "Content-Type": "application/octet-stream"
        });
        return this.success();
    }
});