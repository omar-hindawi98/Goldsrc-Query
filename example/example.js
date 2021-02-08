const Query = require('./../query')

const query = new Query("91.225.104.199", 27015);

// Connect
query.connect();

let online =  query.check_connection().then(() => {
    // Create handlers
    query.on("info", (data) => {
        console.log(data);
    }).on("timeout", (data) => {
        console.log(data);
    }).on("players", (data) => {
        console.log(data);
    }).on("rules", (data) => {
        console.log(data);
    }).on("ping", (latency) => {
        console.log(latency);
    }).on("challenge", () => {
        // Query when challenge received
        query.query_players();
        query.query_rules();
    });

    // Query server info
    query.query_server_info();

    // Get challenge
    query.query_challenge();
}).catch(() => {
    console.log("Failed to connect");

    query.close();
});

