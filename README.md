# QuorielAPI
A high-performance extension for ForgeScript that provides a reliable and scalable way to build HTTP APIs using uWebSockets.js.

## Installation
```
npm i github:quoriel/api uNetworking/uWebSockets.js#v20.52.0
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielApi } = require("@quoriel/api");

const client = new ForgeClient({
    extensions: [
        new QuorielApi({
            port: 12345,   // Port for the HTTP server (default: 3000)
            path: "routes" // Path to routes directory
        })
    ]
});

client.login("...");
```

## Routes
Each route is defined as a module inside the `routes` directory.

```js
module.exports = {
    url: "/*",
    method: "GET",
    code: `$sendText[Hello world!]`
};
```

### Supported methods
`GET`, `HEAD`, `TRACE`, `DELETE`, `OPTIONS`, `PATCH`, `PUT`, `POST`