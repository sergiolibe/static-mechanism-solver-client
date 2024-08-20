class Beam {
    /** @type {string} */
    id;
    /** @type {Node|undefined} */
    startNode;
    /** @type {Node|undefined} */
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
 * @property {string} startNode
 * @property {string} endNode
 */


export default Beam;