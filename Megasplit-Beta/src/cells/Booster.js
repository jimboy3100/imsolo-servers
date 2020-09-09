const Cell = require("./Cell");

class Booster extends Cell {
    /**
     * @param {World} world
     * @param {number} x
     * @param {number} y
     */
    constructor(world, x, y) {
        const size = world.settings.boosterSize;
        super(world, x, y, size, 0xFF3333);

        this.fedTimes = 0;
        this.splitAngle = NaN;
    }

    get type() { return 2; }
    get isSpiked() { return false; }
    get isAgitated() { return false; }
    get avoidWhenSpawning() { return true; }

    /**
     * @param {Cell} other
     * @returns {CellEatResult}
     */
    getEatResult(other) {
        if (other.type === 3) return this.getEjectedEatResult(true);
        if (other.type === 4) return 3;
        return 0;
    }
    /**
     * @param {boolean} isSelf
     * @returns {CellEatResult}
     */
    getEjectedEatResult(isSelf) {
        return this.world.boosterCount >= this.world.settings.boosterMaxCount ? 0 : isSelf ? 2 : 3;
    }

    onSpawned() {
        this.world.boosterCount++;
    }

    /**
     * @param {Cell} cell
     */
    whenAte(cell) {
        const settings = this.world.settings;
        if (settings.boosterPushing) {
            const newD = this.boost.d + settings.boosterPushBoost;
            this.boost.dx = (this.boost.dx * this.boost.d + cell.boost.dx * settings.boosterPushBoost) / newD;
            this.boost.dy = (this.boost.dy * this.boost.d + cell.boost.dy * settings.boosterPushBoost) / newD;
            this.boost.d = newD;
            this.world.setCellAsBoosting(this);
        } else {
            this.splitAngle = Math.atan2(cell.boost.dx, cell.boost.dy);
            if (++this.fedTimes >= settings.boosterFeedTimes) {
                this.fedTimes = 0;
                this.size = settings.boosterSize;
                this.world.splitBooster(this);
            } else super.whenAte(cell);
        }
    }

    /**
     * @param {Cell} cell
     * @param {Player} player
     */
    whenEatenBy(cell) {
        const settings = this.world.settings;
        super.whenEatenBy(cell);
        if (cell.type === 0) cell.size = (cell.size + settings.boosterMassGiven);
        //if (cell.type === 0) this.world.popPlayerCell(cell);
    }

    onRemoved() {
        this.world.boosterCount--;
    }
}

module.exports = Booster;

const World = require("../worlds/World");
