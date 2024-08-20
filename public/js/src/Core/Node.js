class Node {
    /** @type {string} */
    id;
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {NodeType} */
    type;

    /**
     * @param {string} id
     * @param {NodeData} data
     */
    constructor(id, data) {
        this.id = id;
        this.x = data.x;
        this.y = data.y;
        this.type = data.type;
        // Object.freeze(this);
    }
}

/**
 * Enum for Node types
 * @readonly
 * @enum {string}
 */
export const NodeType = {
    U1: 'U1',
    U1U2: 'U1U2',
    JOINT: 'JOINT',
    FREE: 'FREE',
};

/**
 * Data for node
 * @typedef {Object} NodeData
 * @property {number} x
 * @property {number} y
 * @property {NodeType} type
 */

export default Node;