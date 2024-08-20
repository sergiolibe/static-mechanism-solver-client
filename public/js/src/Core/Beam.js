class Beam {
    /** @type {string} */
    id;
    /** @type {string|undefined} */
    startNode;
    /** @type {string|undefined} */
    endNode;

    /**
     * @param {string} id
     */
    constructor(id) {
        this.id = id;
        // Object.freeze(this);
    }
}

/**
 * Data for Beam
 * @typedef {Object} BeamData
 * @property {startNode} string
 * @property {endNode} string
 */


export default Beam;