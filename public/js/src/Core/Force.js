class Force {
    id;
    magnitude;
    angle;
    type;
    _node;

    constructor(id, data) {
        this.id = id;
        this.type = data.type;
        this.magnitude = data.magnitude;
        this.angle = data.angle;
        // Object.freeze(this);
    }

    get node() {
        return this._node;
    }

    set node(value) {
        this._node = value;
    }

    get angleRad() {
        return this.angle * Math.PI / 180;
    }
}

export default Force;