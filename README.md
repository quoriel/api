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
            port: 3000,        // HTTP server port (default: 3000)
            path: "routes",    // Routes directory path
            ssl: {             // HTTPS configuration (optional)
                cert_file_name: "cert.pem",
                key_file_name: "key.pem"
            },
            allowed: {         // Global access control (optional)
                hosts: ["api.example.com"],
                ips: ["192.168.1.1"],
                headers: {
                    "Authorization": "Bearer your-token-here"
                }
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
    cert_file_name: "path/to/cert.pem",     // SSL certificate file
    key_file_name: "path/to/key.pem",       // Private key file
    passphrase: "your_passphrase",          // Password for encrypted private key
    ca_file_name: "path/to/ca.pem",         // Certificate Authority chain file
    ssl_ciphers: "ECDHE-RSA-AES128-...",    // Allowed SSL cipher suites
    ssl_prefer_low_memory_usage: true       // Optimize for lower memory usage
}
```

## Allowed
Access control mechanism for routes that can be configured globally or for individual routes.

```js
allowed: {
    merge: true,    // Merge route settings with global rules
    hosts: [],      // Array of allowed hostnames
    ips: [],        // Array of allowed IP addresses
    headers: {}     // Required request headers
}
```

### Merge
- **false** - disable access control for this route
- **true** or (if not specified at all) - use global rules only
- **{ merge: true, ... }** - merge route settings with global rules (route takes priority)
- **{ ... }** - apply route settings only

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
