const { NativeFunction } = require("@tryforge/forgescript");
const { updateRoutes } = require("../../api");

exports.default = new NativeFunction({
    name: "$updateRoutes",
    description: "Reload all routes from the previously set directory",
    version: "1.0.0",
    unwrap: true,
    execute(ctx) {
        updateRoutes();
        return this.success();
    }
});