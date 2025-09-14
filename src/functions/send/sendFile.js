const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { promises: { stat }, readFile } = require("fs");
const { resolve, extname } = require("path");

const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".avif": "image/avif",
    ".jfif": "image/jpeg",
    ".pjpeg": "image/jpeg",
    ".pjp": "image/jpeg",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
    ".7z": "application/x-7z-compressed",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska"
};

exports.default = new NativeFunction({
    name: "$sendFile",
    description: "Send any file to be opened or downloaded in the browser",
    version: "1.2.0",
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
        const { response } = ctx.runtime.extras;
        const filePath = resolve(path);
        const ext = extname(filePath).toLowerCase();
        const mime = types[ext] || "application/octet-stream";
        const info = await stat(filePath);
        response.cork(() => {
            response.writeHeader("Content-Type", mime);
            response.writeHeader("Content-Length", info.size.toString());
        });
        readFile(filePath, (err, buffer) => {
            if (err) {
                response.cork(() => {
                    response.writeStatus("404 Not Found");
                    response.end("File not found");
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
                            [ok, done] = response.tryEnd(sliced, sliced.length);
                        });
                        return !done;
                    });
                }
            });
        });
        return this.success();
    }
});