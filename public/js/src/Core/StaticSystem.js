import Beam from "./Beam.js";
import Force from "./Force.js";
import Node from "./Node.js";

class StaticSystem {
    /** @type {{ nodes:Record<string,NodeData>, beams:Record<string,BeamData>, forces:Record<string,ForceData>}} */
    data;
    /** @type {Record<string,NodeData>} */
    nodesData;
    /** @type {Record<string,BeamData>} */
    beamsData;
    /** @type {Record<string,ForceData>} */
    forcesData;

    /** @type {Record<string,Node>} */
    nodes = {};
    /** @type {Record<string,Beam>} */
    beams = {};
    /** @type {Record<string,Force>} */
    forces = {};

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
        this.nodes = {};
        this.beams = {};
        this.forces = {};
    }

    reBuild(data) {
        this._reset();
        this._build(data);
    }

    setup() {
        Object.keys(this.nodesData).forEach((nodeId) => {
            let node = new Node(nodeId, this.nodesData[nodeId]);
            this.nodes[node.id] = node;
        });

        Object.keys(this.beamsData).forEach((beamId) => {
            let beam = new Beam(beamId);

            beam.startNode = this.nodes[this.beamsData[beamId].startNode];
            beam.endNode = this.nodes[this.beamsData[beamId].endNode];

            this.beams[beam.id] = beam;
        });

        Object.keys(this.forcesData).forEach((forceId) => {
            let force = new Force(forceId, this.forcesData[forceId]);

            force.node = this.nodes[this.forcesData[forceId].node];

            this.forces[force.id] = force;
        });

        // console.log(this.nodes);
        // console.log(this.beams);
        // console.log(this.forces);
    }

    /**
     * @param nodeId
     * @returns {Node|undefined}
     */
    getNodeById(nodeId) {
        // console.log('getting node by id ' + nodeId);
        return this.nodes[nodeId];
    }

    /**
     * @param forceId
     * @returns {Force|undefined}
     */
    getForceById(forceId) {
        // console.log('getting force by id ' + forceId);
        return this.forces[forceId];
    }

    /**
     * @param beamId
     * @returns {Beam|undefined}
     */
    getBeamById(beamId) {
        // console.log('getting beam by id ' + beamId);
        return this.beams[beamId];
    }

    generateCandidateNewNodeName() {
        let lastNodeName = Object.keys(this.nodes).pop();
        let numberInName = lastNodeName.slice(1);
        let number = parseInt(numberInName);
        let letter = lastNodeName[0];

        if (isNaN(number)) {
            return lastNodeName + '_2';
        } else {
            return letter + (number + 1);
        }
    }

    generateCandidateNewBeamName() {
        let lastBeamName = Object.keys(this.beams).pop();
        let numberInName = lastBeamName.slice(1);
        let number = parseInt(numberInName);
        let letter = lastBeamName[0];

        if (isNaN(number)) {
            return lastBeamName + '_2';
        } else {
            return letter + (number + 1);
        }
    }
}

export default StaticSystem;