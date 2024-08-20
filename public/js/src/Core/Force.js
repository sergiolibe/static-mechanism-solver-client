class Force {
    /** @type {string} */
    id;
    /** @type {number|undefined} */
    magnitude;
    /** @type {number} */
    angle;
    /** @type {ForceType} */
    type;
    /** @type {string|undefined} */
    node;

    constructor(id, data) {
        this.id = id;
        this.type = data.type;
        this.magnitude = data.magnitude;
        this.angle = data.angle;
        // Object.freeze(this);
    }

    get angleRad() {
        return this.angle * Math.PI / 180;
    }
}

/**
 * Enum for Force types
 * @readonly
 * @enum {string}
 */
export const ForceType = {
    DEFINED: 'DEFINED',
    UNKNOWN: 'UNKNOWN',
};

/**
 * Data for Force
 * @typedef {Object} ForceData
 * @property {number} angle
 * @property {number|undefined} magnitude
 * @property {ForceType} type
 * @property {string} node
 */


export default Force;