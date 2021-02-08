# Goldsrc-Query
A query tool for retrieving information through UDP using the GoldSrc Query Protocol.
<br >
**Version:** ES5/ES6

## Include library
Include the library by adding following snippet to your code
```javascript
const Query = require('./query');
```

## Functions
Functions that are available in the library.
```javascript
const query = new Query(address, port, VERBOSE);

// Connection
query.connect(); // Starts the socket
query.close(); // Closes the socket

// Change Verbose
query.set_verbose(value);

// Query functions
query.query_challenge(); // Gets the challenge for player & rules query
query.query_players(); // Gets the players
query.query_rules(); // Gets the rules
query.query_server_info(); // Gets the server info
query.query_ping(); // Pings the server, returns latency
```

## Events
Events emitted by the query tool.
```javascript
// Socket
query.on("error", (err) => {});
query.on("listening", () => {});
query.on("close", () => {});

// Response
query.on("challenge", (challenge) => {});
query.on("info", (data) => {});
query.on("players", (data) => {});
query.on("rules", (data) => {});
query.on("ping", (latency) => {});
query.on("timeout", (err) => {}); // If a UDP package times out
query.on("challenge_unset", (err) => {}); // If challenge is not set
```

## Examples
Examples can be found under the folder /example.