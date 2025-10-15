const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getBody",
    description: "Gets the request body from POST, PUT, PATCH requests",
    version: "1.5.0",
    output: ArgType.Unknown,
    unwrap: false,
    async execute(ctx) {
        return this.success(await new Promise(resolve => {
            const chunks = [];
            ctx.runtime.extras.response.onData((chunk, isLast) => {
                chunks.push(new Uint8Array(chunk).slice());
                if (isLast) {
                    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                    const combined = new Uint8Array(length);
                    let offset = 0;
                    for (const chunk of chunks) {
                        combined.set(chunk, offset);
                        offset += chunk.length;
                    }
                    const result = new TextDecoder("utf-8").decode(combined);
                    resolve(result);
                }
            });
        }));
    }
});