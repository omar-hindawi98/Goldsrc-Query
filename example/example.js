const Query = require('./../query')

const query = new Query("192.168.0.107", 27015);

// Connect
query.connect();

// Try connecting to UDP
query.check_connection().then((latency) => {
    console.log("Latency: " + latency);

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
    }).on("error", (err) => {
        console.log("err");
    });

    // Query server info
    query.query_server_info();

    // Get challenge
    query.query_challenge();
}).catch(() => {
    console.log("Failed to connect");

    query.closeUDP();
});

query.connect_rcon("test123");
