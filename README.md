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
            port: 12345,    // Port for the HTTP server (default: 3000)
            path: "routes", // Path to routes directory
            ssl: {          // SSL options for HTTPS (optional)
                cert_file_name: "cert.pem",
                key_file_name: "key.pem"
            }
        })
    ]
});

client.login("...");
```

## SSL
For HTTPS support, provide SSL options. If SSL options are present, the server will use `SSLApp`, otherwise it will use regular `App`.

**Available SSL options:** See [uWebSockets.js AppOptions](https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html)

```js
ssl: {
    cert_file_name: "path/to/cert.pem",
    key_file_name: "path/to/key.pem",
    passphrase: "your_passphrase",        // optional
    ca_file_name: "path/to/ca.pem",       // optional
    ssl_ciphers: "ECDHE-RSA-AES128-...",  // optional
    ssl_prefer_low_memory_usage: true     // optional
}
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