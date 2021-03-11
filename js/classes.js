"use strict";

class StaticSystem {
    data;
    nodesData;
    beamsData;
    forcesData;

    _nodes = {};
    _beams = {};
    _forces = {};

    constructor(data) {
        // console.log(data);
        this.data = data;
        this.nodesData = data.nodes;
        this.beamsData = data.beams;
        this.forcesData = data.forces;

        this.setup()
    }

    get beams() {
        return this._beams;
    }

    get nodes() {
        return this._nodes;
    }

    get forces() {
        return this._forces;
    }

    getBeam(beamId) {
        return this._beams[beamId];
    }

    setup() {
        Object.keys(this.nodesData).forEach((nodeId) => {
            let node = new Node(nodeId, this.nodesData[nodeId]);
            this._nodes[node.id] = node;
        });

        Object.keys(this.beamsData).forEach((beamId) => {
            let beam = new Beam(beamId);

            beam._startNode = this._nodes[this.beamsData[beamId].startNode];
            beam._endNode = this._nodes[this.beamsData[beamId].endNode];

            this._beams[beam.id] = beam;
        });

        Object.keys(this.forcesData).forEach((forceId) => {
            let force = new Force(forceId, this.forcesData[forceId]);

            force._node = this._nodes[this.forcesData[forceId].node];

            this._forces[force.id] = force;
        });

        // console.log(this._nodes);
        // console.log(this._beams);
        // console.log(this._forces);
    }

    getNodeById(nodeId) {
        //console.log('getting node by id ' + nodeId);
        return this._nodes[nodeId];
    }

    getForceById(forceId) {
        //console.log('getting force by id ' + forceId);
        return this._forces[forceId];
    }

    getBeamById(beamId) {
        //console.log('getting beam by id ' + beamId);
        return this._beams[beamId];
    }
}

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
    }
}

class Beam {
    _id;
    _startNode;
    _endNode;

    constructor(id) {
        this._id = id;
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
//
// module.exports = {
//     StaticSystem,
//     Node,
//     Beam,
//     Force
// }