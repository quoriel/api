const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { promises: { stat }, readFile } = require("fs");
const { resolve, basename } = require("path");

exports.default = new NativeFunction({
    name: "$sendAttachment",
    description: "Send a file as an attachment",
    version: "1.3.0",
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
            description: "Attachment filename",
            type: ArgType.String,
            required: false,
            rest: false
        }
    ],
    async execute(ctx, [path, name]) {
        const { response } = ctx.runtime.extras;
        const filePath = resolve(path);
        const fileName = name || basename(filePath);
        const info = await stat(filePath);
        response.cork(() => {
            response.writeHeader("Content-Disposition", `attachment; filename="${fileName}"`).writeHeader("Content-Type", "application/octet-stream").writeHeader("Content-Length", info.size.toString());
        });
        readFile(filePath, (err, buffer) => {
            if (err) {
                response.cork(() => {
                    response.writeStatus("404 Not Found").end("File not found");
                });
                return;
            }
            response.cork(() => {
                let [ok, done] = response.tryEnd(buffer, buffer.length);
                if (done) return;
                if (!ok) {
                    response.onWritable(offset => {
                        response.cork(() => {
                            const sliced = buffer.subarray(offset);
                            [ok, done] = response.tryEnd(sliced, buffer.length);
                        });
                        return !done;
                    });
                }
            });
        });
        return this.success();
    }
});