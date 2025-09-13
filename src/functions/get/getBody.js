const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$getBody",
    description: "Gets the request body from POST, PUT, PATCH requests",
    version: "1.0.0",
    output: ArgType.Unknown,
    unwrap: true,
    async execute(ctx) {
        const { response } = ctx.runtime.extras;
        const body = await new Promise((resolve) => {
            const chunks = [];
            response.onData((chunk, isLast) => {
                chunks.push(new Uint8Array(chunk).slice());
                if (isLast) {
                    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                    const combined = new Uint8Array(totalLength);
                    let offset = 0;
                    for (const chunk of chunks) {
                        combined.set(chunk, offset);
                        offset += chunk.length;
                    }
                    const bodyText = new TextDecoder("utf-8").decode(combined);
                    resolve(bodyText);
                }
            });
        });
        return this.success(body);
    }
});