const { ForgeExtension } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { initializer } = require("./api");

class QuorielApi extends ForgeExtension {
    name = "QuorielApi";
    description = description;
    version = version;

    constructor(options = {}) {
        super();
        this.options = options;
    }

    init(client) {
        this.load(__dirname + "/functions");
        initializer(this.options, client);
    }
}

module.exports = { QuorielApi };