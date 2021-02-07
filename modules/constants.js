const OFFSET_BYTES = [0xFFFFFFFF];

/**
 * Queries information about the server
 * @type {number[]}
 */
const A2S_INFO = OFFSET_BYTES.concat([
    0x54, 0x53, 0x6F, 0x75,
    0x72, 0x63, 0x65, 0x20,
    0x45, 0x6E, 0x67, 0x69,
    0x6E, 0x65, 0x20, 0x51,
    0x75, 0x65, 0x72, 0x79,
    0x00]);

/**
 * Queries information about the players
 * @type {number[]}
 */
const A2S_PLAYER = OFFSET_BYTES.concat([
    0x55]); // Append challenge number to this

const A2S_PLAYER_CHALLENGE = A2S_PLAYER.concat(OFFSET_BYTES);

/**
 * Queries information about the server rules
 * @type {number[]}
 */
const A2S_RULES = OFFSET_BYTES.concat([
    0x56]);

const A2S_RULES_CHALLENGE = A2S_RULES.concat(OFFSET_BYTES);

/**
 * Pings the server
 * @type {number[]}
 */
const A2A_PING = OFFSET_BYTES.concat([
    0x69]);

/**
 * Retrieves a challenge from the server, used for other query types
 * @type {number[]}
 */
const A2S_SERVERQUERY_GETCHALLENGE = OFFSET_BYTES.concat([
    0x57]);


/**
 * Used for checking response header byte
 */
const HEADER = {
    A2S_INFO: 0x6D,
    A2A_PING: 0x6A,
    A2S_PLAYER: 0x44,
    A2S_RULES: 0x45,
    A2S_SERVERQUERY_GETCHALLENGE: 0x41
};

module.exports = {
    A2S_INFO,
    A2A_PING,
    A2S_PLAYER,
    A2S_PLAYER_CHALLENGE,
    A2S_RULES,
    A2S_RULES_CHALLENGE,
    A2S_SERVERQUERY_GETCHALLENGE,
    HEADER
};