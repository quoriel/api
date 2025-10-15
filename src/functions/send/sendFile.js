const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { mime } = require("../../mime");
const { streamFile } = require("../../file");
const { extname } = require("path");

exports.default = new NativeFunction({
    name: "$sendFile",
    description: "Send a file for viewing in the browser",
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
        }
    ],
    async execute(ctx, [path]) {
        await streamFile(ctx.runtime.extras.response, path, {
            "Content-Type": mime.get(extname(path).toLowerCase()) || "application/octet-stream"
        });
        return this.success();
    }
});