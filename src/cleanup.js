const { unlinkSync, existsSync, readdirSync } = require("fs");
const { join, dirname } = require("path");
let directory;
try {
    const main = require.resolve("uWebSockets.js");
    directory = dirname(main);
} catch {
    return;
}
const keep = `uws_${process.platform}_${process.arch}_${process.versions.modules}.node`;
if (!existsSync(join(directory, keep))) {
    return;
}
const files = readdirSync(directory);
files.forEach(file => {
    if (file.startsWith("uws_") && file.endsWith(".node")) {
        if (file !== keep) {
            const path = join(directory, file);
            try {
                unlinkSync(path);
            } catch {
                // it just works ¯\_(ツ)_/¯
            }
        }
    }
});