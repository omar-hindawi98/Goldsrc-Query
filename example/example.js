const Query = require('./../query')


var query = new Query("213.238.173.79");

query.set_verbose(true);

query.connect();

// Create handlers
query.on("server_info", (data) => {
    console.log(data);
});

//
query.query_server_info();