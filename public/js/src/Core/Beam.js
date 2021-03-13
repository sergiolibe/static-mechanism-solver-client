class Beam {
    _id;
    _startNode;
    _endNode;

    constructor(id) {
        this._id = id;
        // Object.freeze(this);
    }

    get id() {
        return this._id;
    }

    get startNode() {
        return this._startNode;
    }

    get endNode() {
        return this._endNode;
    }

    set startNode(value) {
        this._startNode = value;
    }

    set endNode(value) {
        this._endNode = value;
    }
}

export default Beam;