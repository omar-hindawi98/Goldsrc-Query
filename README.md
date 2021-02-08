# Goldsrc-Query
A query tool for retrieving information through UDP using the GoldSrc Query Protocol.
<br >
Will soon have support for TCP/IP interaction with rcon of server.
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

query.check_connection() // Returns a promise with latency
        .then( (latency) => {})
        .catch(() => {}); 

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
query.on("challenge", (challenge) => {}); // On challenge response
query.on("info", (data) => {}); // On Server info response
query.on("players", (data) => {}); // On players info response
query.on("rules", (data) => {}); // On rules response
query.on("ping", (latency) => {}); // On pong
query.on("timeout", (err) => {}); // If a UDP package times out
query.on("challenge_unset", (err) => {}); // If challenge is not set
```

## Examples
Examples can be found under the folder /example.