const Gamemode = require("./Gamemode");
const Misc = require("../primitives/Misc");

/**
 * @param {Player} player
 * @param {Player} requesting
 * @param {number} index
 */
function getLeaderboardData(player, requesting, index) {
    return {
        name: player.leaderboardName,
        highlighted: (requesting || { }).id === (player || { }).id,
        cellId: (player.ownedCells[0] || { }).id,
        position: 1 + index
    };
}

class FFA extends Gamemode {
    /**
     * @param {ServerHandle} handle
     */
    constructor(handle) {
        super(handle);
    }

    static get type() { return 0; }
    static get name() { return "FFA"; }

    /**
     * @param {Player} player
     * @param {string} name
     * @param {string} skin
     */

    onPlayerSpawnRequest(player, name, skin) {
        if (player.state === 0 || !player.hasWorld) return;
        const size = player.router.type === "minion" ?
             this.handle.settings.minionSpawnSize :
             this.handle.settings.playerSpawnSize;
        const spawnInfo = player.world.getPlayerSpawn(size);
        const color = spawnInfo.color || Misc.randomColor();
        player.cellName = player.chatName = player.leaderboardName = name;
        player.cellSkin = skin;
        player.chatColor = player.cellColor = color;
        let censoredNicknames = this.handle.settings.playerCensoredNames.join(' '); // converts the list to a string with each word separated
        let nicknameToTest = player.cellName.split('}').join('} '); // for CIGAR clients : splits the } from the nick to avoid bypass
        //if (censoredNicknames.includes(player.cellName)) player.cellName = 'An Unnamed Cell'; // old code, broken af
        let checkingCensoredNickname = censoredNicknames.split(/\s+/g),
        checkingNickname = nicknameToTest.split(/\s+/g),
        i,
        j;
        for (i = 0; i < checkingCensoredNickname.length; i++) {
            for (j = 0; j < checkingNickname.length; j++) {
                if (checkingCensoredNickname[i].toLowerCase() == checkingNickname[j].toLowerCase()) {
                    player.cellName = 'WWW-IMSOLO-PRO';
                    player.chatName = 'An Unnamed Cell';
                    player.leaderboardName = 'An Unnamed Cell'; 
                    name = 'An Unnamed Cell'; 
                    // censors the nickname because one or more words are banned
                }
            }
        }
        player.world.spawnPlayer(player, spawnInfo.pos, size, name, null);
    }

    /**
     * @param {World} world
     */
    compileLeaderboard(world) {
        world.leaderboard = world.players.slice(0).filter((v) => !isNaN(v.score) && v.ownedCells && v.ownedCells.length > 0).sort((a, b) => b.score - a.score);
    }

    /**
     * @param {Connection} connection
     */
    sendLeaderboard(connection) {
        if (!connection.hasPlayer) return;
        const player = connection.player;
        if (!player.hasWorld) return;
        if (!player.id) return;
        if (player.world.frozen) return;
        /** @type {Player[]} */
        const leaderboard = player.world.leaderboard;
        const data = leaderboard.map((v, i) => getLeaderboardData(v, player, i));
        const selfData = isNaN(player.score) ? null : data[leaderboard.indexOf(player)];
        connection.protocol.onLeaderboardUpdate("ffa", data.slice(0, 10), selfData);
    }
}

module.exports = FFA;

const ServerHandle = require("../ServerHandle");
const World = require("../worlds/World");
const Connection = require("../sockets/Connection");
const Player = require("../worlds/Player");
