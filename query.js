const dgram = require('dgram');

const BufferExt = require('./modules/BufferExt')
        , utils = require('util')
        , events = require('events')
        , Latency = require('./modules/Latency')
        , constants = require('./modules/constants');

function Query(address, port = 27015, VERBOSE = false){
    // Constructor
    if(!(this instanceof Query))
        return new Query(address, port, VERBOSE);
    this.address = address;
    this.port = port;
    this.VERBOSE = VERBOSE;

    // Information variables
    this.challenge = null;
    this.server_info = null;
    this.players_info = null;
    this.rules_info = null;
    this.latency = new Latency();

    events.EventEmitter.call(this);
}

utils.inherits(Query, events.EventEmitter);

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
    this.client = dgram.createSocket('udp4');

    // Bind event listeners
    this.client
        .on("message", (data) => {
            this._onReceiveData(data);
        })
        .on("error", (err) => {
            this.emit("error", err);
        })
        .on("listening", () => {
            this.emit("listening");
        })
        .on("close", () => {
            this.emit("close");
        });
};

/**
 * UDP Receive response
 */
Query.prototype._onReceiveData = function(msg){
    // Receive message
    let data = new BufferExt(msg);

    // Remove all 4 0xFF
    data.removeOffset(4);

    // Handle message
    let header = data.readByte();

    switch(header){
        case constants.HEADER.A2S_INFO:
            this._handle_server_info(data);
            break;
        case constants.HEADER.A2A_PING:
            this._handle_ping();
            break;
        case constants.HEADER.A2S_PLAYER:
            this._handle_players(data);
            break;
        case constants.HEADER.A2S_RULES:
            // MIGHT BE DEPRECATED
            this._handle_rules(data);
            break;
        case constants.HEADER.A2S_SERVERQUERY_GETCHALLENGE:
            this._handle_challenge(data);
            break;
    }
};

/**
 * Init message handlers
 */
Query.prototype._handle_challenge = function(data){
    if(this.VERBOSE) console.log("RESPONSE - CHALLENGE");

    this.challenge = data.readLong(true);

    this.emit("challenge", this.challenge);
};

Query.prototype._handle_server_info = function(data){
    if(this.VERBOSE) console.log("RESPONSE - SERVER_INFO");

    this.server_info = {
        latency: null,
        address: data.readString(),
        name: data.readString(),
        map: data.readString(),
        folder: data.readString(),
        game: data.readString(),
        players: data.readByte(),
        players_info: [],
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
        rules_info: null,
        vac: null,
        bots: null
    }

    // additional info
    if(this.server_info.mod_info.mod == 1){
        this.server_info.mod_info.link = data.readString();
        this.server_info.mod_info.dl_link = data.readString();
        data.readByte();
        this.server_info.mod_info.version = data.readLong();
        this.server_info.mod_info.size = data.readLong();
        this.server_info.mod_info.type = data.readByte();
        this.server_info.mod_info.dll = data.readByte();
    }

    this.server_info.vac = data.readByte();
    this.server_info.bots = data.readByte();

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

    this.emit("rules", this.rules_info);
};

Query.prototype._handle_ping = function(){
    if(this.VERBOSE) console.log("RESPONSE - PING");

    this.latency.stop();

    // Emit new event
    this.emit("ping", this.latency);
};

/**
 * Query functions
 */
Query.prototype.query_challenge = function(){
    if(this.VERBOSE) console.log("QUERY - CHALLENGE");

    this.client.send(Buffer.from(constants.A2S_PLAYER_CHALLENGE), this.port, this.address);
};

Query.prototype.query_server_info = function(){
    if(this.VERBOSE) console.log("QUERY - SERVER_INFO");

    this.client.send(Buffer.from(constants.A2S_INFO), this.port, this.address);
};

Query.prototype.query_players = function(){
    if(this.challenge == null){
        this.emit("error", new Error("Challenge not set"));
        return;
    }

    if(this.VERBOSE) console.log("QUERY - PLAYERS");

    this.client.send(Buffer.concat([Buffer.from(constants.A2S_PLAYER), this.challenge]), this.port, this.address);
};

Query.prototype.query_rules = function(){
    if(this.challenge == null){
        this.emit("error", new Error("Challenge not set"));
        return;
    }

    if(this.VERBOSE) console.log("QUERY - RULES");

    this.client.send(Buffer.concat([Buffer.from(constants.A2S_RULES), this.challenge]), this.port, this.address);
};

Query.prototype.query_ping = function(){
    if(this.VERBOSE) console.log("QUERY - PING");

    this.latency.start();
    this.client.send(Buffer.from(constants.A2A_PING), this.port, this.address);
};

/**
 * Close socket connection
 */
Query.prototype.close = function(){
    if(this.VERBOSE) console.log("CLOSING CONNECTION");

    this.client.close();
};

module.exports = Query;