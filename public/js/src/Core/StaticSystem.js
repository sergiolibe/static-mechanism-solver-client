import Beam from "./Beam.js";
import Force from "./Force.js";
import Node from "./Node.js";

class StaticSystem {
    data;
    nodesData;
    beamsData;
    forcesData;

    _nodes = {};
    _beams = {};
    _forces = {};

    constructor(data) {
        this._build(data);
    }

    _build(data) {
        // console.log(data);
        this.data = data;

        if (data.hasOwnProperty('nodes'))
            this.nodesData = data.nodes;
        else
            throw new Error('data.nodes is not defined')

        if (data.hasOwnProperty('beams'))
            this.beamsData = data.beams;
        else
            throw new Error('data.beams is not defined')

        if (data.hasOwnProperty('forces'))
            this.forcesData = data.forces;
        else
            throw new Error('data.forces is not defined')

        this.setup();
        // Object.freeze(this);
    }

    _reset() {
        this.data = {};
        this.nodesData = {};
        this.beamsData = {};
        this.forcesData = {};
        this._nodes = {};
        this._beams = {};
        this._forces = {};
    }

    reBuild(data) {
        this._reset();
        this._build(data);
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
        // console.log('getting node by id ' + nodeId);
        return this._nodes[nodeId];
    }

    getForceById(forceId) {
        // console.log('getting force by id ' + forceId);
        return this._forces[forceId];
    }

    getBeamById(beamId) {
        // console.log('getting beam by id ' + beamId);
        return this._beams[beamId];
    }
}

export default StaticSystem;