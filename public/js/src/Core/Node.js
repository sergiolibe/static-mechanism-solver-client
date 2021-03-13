class Node {
    id;
    x;
    y;
    type;

    constructor(id,data) {
        this.id = id;
        this.x = data.x;
        this.y = data.y;
        this.type = data.type;
        // Object.freeze(this);
    }
}


export default Node;