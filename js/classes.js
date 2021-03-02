"use strict";

class StaticSystem {
    nodesData;
    beamsData;
    forcesData;

    _nodes = {};
    _beams = {};
    _forces = {};

    constructor(data) {
        // console.log(data);
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
        this.nodesData.forEach((nodeData) => {
            let node = new Node(nodeData);
            this._nodes[node.id] = node;
        });

        this.beamsData.forEach((beamData) => {
            let beam = new Beam(beamData);

            beam._startNode = this._nodes[beamData.startNode];
            beam._endNode = this._nodes[beamData.endNode];

            this._beams[beam.id] = beam;
        });

        this.forcesData.forEach((forceData) => {
            let force = new Force(forceData);

            force._node = this._nodes[forceData.node];

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

    constructor(data) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.type = data.type;
    }
}

class Beam {
    _id;
    _startNode;
    _endNode;

    constructor(data) {
        this._id = data.id;
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

    constructor(data) {
        this.id = data.id;
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