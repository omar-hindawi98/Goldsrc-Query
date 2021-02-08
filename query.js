const dgram = require('dgram')
    , BufferExt = require('./modules/BufferExt')
    , inherits = require('util').inherits
    , EventEmitter = require('events')
    , Latency = require('./modules/Latency')
    , {UDP_RESPONSE, UDP_PACKET, TCP_RESPONSE, TCP_PACKET} = require('./modules/constants');

function Query(address, port = 27015, timeout = 1500, VERBOSE = false){
    // Constructor
    if(!(this instanceof Query))
        return new Query(address, port, VERBOSE);
    this.address = address;
    this.port = port;
    this.VERBOSE = VERBOSE;
    this.timeout = timeout;

    // Information variables
    this.latency = new Latency();

    EventEmitter.call(this);
}

inherits(Query, EventEmitter);

/**
 * Set verbose
 */

Query.prototype.set_verbose = function(value){
    this.VERBOSE = value;
};

/**
 * Initialize connection
 */
Query.prototype.connect = function(){
    // Debugging
    if(this.VERBOSE) console.log("Socket for UDP4 created");

    // Start socket
    this._client = dgram.createSocket('udp4');

    // Bind event listeners
    this._client.on("message", (data) => {
        this._onReceiveData(data);
    }).on("error", (err) => {
        this.emit("error", err);
    }).on("listening", () => {
        this.emit("listening");
    }).on("close", () => {
        this.emit("close");
    });
};

/**
 * UDP Receive response
 */
Query.prototype._onReceiveData = function(msg){
    // Receive message
    let data = new BufferExt(msg);

    // Remove 0xFFFFFFFF header
    data.removeOffset(4);

    // Handle message
    let header = data.readByte();

    switch(header){
        case UDP_RESPONSE.A2S_INFO:
            this._handle_server_info(data);
            break;
        case UDP_RESPONSE.A2A_PING:
            this._handle_ping();
            break;
        case UDP_RESPONSE.A2S_PLAYER:
            this._handle_players(data);
            break;
        case UDP_RESPONSE.A2S_RULES:
            // MIGHT BE DEPRECATED
            this._handle_rules(data);
            break;
        case UDP_RESPONSE.A2S_SERVERQUERY_GETCHALLENGE:
            this._handle_challenge(data);
            break;
    }
};

/**
 * Message handlers
 */
Query.prototype._handle_challenge = function(data){
    if(this.VERBOSE) console.log("RESPONSE - CHALLENGE");

    this.challenge = data.readLong(true);

    // Clear timeout
    clearTimeout(this.challenge_timeout);

    this.emit("challenge", this.challenge);
};

Query.prototype._handle_server_info = function(data){
    if(this.VERBOSE) console.log("RESPONSE - SERVER_INFO");

    this.server_info = {
        address: data.readString(),
        name: data.readString(),
        map: data.readString(),
        folder: data.readString(),
        game: data.readString(),
        players: data.readByte(),
        max_players: data.readByte(),
        protocol: data.readByte(),
        server_type: data.readByte(true),
        env: data.readByte(true),
        visibility: data.readByte(),
        mod_info:{
            mod: data.readByte(),
            link: null,
            dl_link: null,
            version: null,
            size: null,
            type: null,
            dll: null,
        },
        vac: null,
        bots: null
    };

    // additional info
    if(this.server_info.mod_info.mod == 1){
        this.server_info.mod_info.link = data.readString();
        this.server_info.mod_info.dl_link = data.readString();
        data.readByte(); // NULL BYTE
        this.server_info.mod_info.version = data.readLong();
        this.server_info.mod_info.size = data.readLong();
        this.server_info.mod_info.type = data.readByte();
        this.server_info.mod_info.dll = data.readByte();
    }

    this.server_info.vac = data.readByte();
    this.server_info.bots = data.readByte();

    clearTimeout(this.info_timeout);

    this.emit("info", this.server_info);
}

Query.prototype._handle_players = function(data){
    if(this.VERBOSE) console.log("RESPONSE - PLAYERS");

    let total_players = data.readByte();
    this.players_info = [];

    for(let i = 0; i < total_players; i++){
        this.players_info.push({
            index: data.readByte(),
            name: data.readString(),
            score: data.readLong(),
            duration: data.readFloat()
        });
    }

    clearTimeout(this.players_timeout);

    this.emit("players", this.players_info);
};

Query.prototype._handle_rules = function(data){
    if(this.VERBOSE) console.log("RESPONSE - RULES");

    this.rules_info = {
        total: data.readShort(),
        list: []
    };

    for(let i = 0; i < total_rules; i++){
        this.rules_info.list.push({
            name: data.readString(),
            value: data.readString()
        });
    }

    clearTimeout(this.rules_timeout);

    this.emit("rules", this.rules_info);
};

Query.prototype._handle_ping = function(){
    if(this.VERBOSE) console.log("RESPONSE - PING");

    this.latency.stop();

    clearTimeout(this.ping_timeout);

    // Emit new event
    this.emit("ping", this.latency.difference());
};

/**
 * Query functions
 */
Query.prototype.query_challenge = function(){
    if(this.VERBOSE) console.log("QUERY - CHALLENGE");

    this.challenge_timeout = setTimeout(() => {
        this.emit("timeout", new Error("Challenge timed out"));
    }, this.timeout);

    this._client.send(Buffer.from(UDP_PACKET.A2S_PLAYER_CHALLENGE), this.port, this.address);
};

Query.prototype.query_server_info = function(){
    if(this.VERBOSE) console.log("QUERY - SERVER_INFO");

    this.info_timeout = setTimeout(() => {
        this.emit("timeout", new Error("Server info timed out"));
    }, this.timeout);

    this._client.send(Buffer.from(UDP_PACKET.A2S_INFO), this.port, this.address);
};

Query.prototype.query_players = function(){
    if(this.challenge == null){
        this.emit("timeout", new Error("Challenge not set"));
        return;
    }

    if(this.VERBOSE) console.log("QUERY - PLAYERS");

    this.players_timeout = setTimeout(() => {
        this.emit("timeout", new Error("Players timed out"));
    }, this.timeout);

    this._client.send(Buffer.concat([Buffer.from(UDP_PACKET.A2S_PLAYER), this.challenge]), this.port, this.address);
};

Query.prototype.query_rules = function(){
    if(this.challenge == null){
        this.emit("timeout", new Error("Challenge not set"));
        return;
    }

    if(this.VERBOSE) console.log("QUERY - RULES");

    this.rules_timeout = setTimeout(() => {
        this.emit("timeout", new Error("Rules timed out"));
    }, this.timeout);

    this._client.send(Buffer.concat([Buffer.from(UDP_PACKET.A2S_RULES), this.challenge]), this.port, this.address);
};

Query.prototype.query_ping = function(){
    if(this.VERBOSE) console.log("QUERY - PING");

    this.ping_timeout = setTimeout(() => {
        this.emit("timeout", new Error("Ping timed out"));
    }, this.timeout);

    this.latency.start();
    this._client.send(Buffer.from(UDP_PACKET.A2A_PING), this.port, this.address);
};

/**
 * Check connection
 */

Query.prototype.check_connection = async function(){
    this.query_ping();

    let self = this;
    let promise = await new Promise((resolve, reject) => {
        self.on("ping", (latency) => {
            return resolve(latency);
        }).on("timeout", (err) => {
            return reject("Failed to connect");
        });
    });

    return promise;
}

/**
 * Close socket connection
 */
Query.prototype.close = function(){
    if(this.VERBOSE) console.log("CLOSING CONNECTION");

    this._client.close();
};

module.exports = Query;