import BackgroundCanvas from "./BackgroundCanvas.js";
import BaseCanvas from "./BaseCanvas.js";
import Beam from "./../Core/Beam.js";
import FileManager from "./../Communication/FileManager.js";
import Geometry from "./../Utils/Geometry.js";
import Node from "./../Core/Node.js";
import StaticCanvas from "./StaticCanvas.js";
import StaticSystem from "./../Core/StaticSystem.js";

class DynamicCanvas extends BaseCanvas {
    /** @type {StaticSystem} */
    staticSystem;
    /** @type {StaticCanvas} */
    staticCanvas;
    /** @type {BackgroundCanvas} */
    backgroundCanvas;
    /** @type {FileManager} */
    fileManager;
    /** @type {'creating-beam','creating-node','deleting-element','free','movingCanvas','movingNode'} */
    mouseMode = 'free';
    /** @type {Beam|Node|null} */
    activeElement = null;
    /** @type {{x: number, y: number}} */
    referencePoint = {};
    /** @type {{n1:Node|null,n2:Node|null}} */
    beamCreation = {n1: null, n2: null};

    constructor(canvasNodeId) {
        super(canvasNodeId);
        this.setupEvents();
    }

    set staticSystem(staticSystem) {
        if (staticSystem instanceof StaticSystem)
            this.staticSystem = staticSystem;
        else
            throw new Error('Expected instance of StaticSystem, get: ' + staticSystem)
    }

    set staticCanvas(staticCanvas) {
        if (staticCanvas instanceof StaticCanvas)
            this.staticCanvas = staticCanvas;
        else
            throw new Error('Expected instance of StaticCanvas, get: ' + staticCanvas)
    }

    set backgroundCanvas(backgroundCanvas) {
        if (backgroundCanvas instanceof BackgroundCanvas)
            this.backgroundCanvas = backgroundCanvas;
        else
            throw new Error('Expected instance of BackgroundCanvas, get: ' + backgroundCanvas)
    }

    set fileManager(fileManager) {
        if (fileManager instanceof FileManager)
            this.fileManager = fileManager;
        else
            throw new Error('Expected instance of FileManager, get: ' + fileManager)
    }

    drawCoordinatePosition(word, x, y) {
        let previousFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'black';
        let text = word + ' ( ' + this.xPxToPt(x) + ' , ' + this.yPxToPt(y) + ' )';

        // this.context.clearRect(10, this.canvasInstance.height - 20, this.canvasInstance.width / 2, 20);

        this.drawWordReal(10, this.canvasInstance.height - 10, text);

        this.context.fillStyle = previousFillStyle;
    }

    highlightActiveElement() {
        this.updateCursor();
        let previousFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'magenta';

        // this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);

        if (this.activeElement === null)
            return;

        let text = '<>';
        if (this.activeElement instanceof Node) {
            this.drawSelectedNode(this.activeElement);
            text = 'Node: ' + this.activeElement.id + ' [ x: ' + this.activeElement.x + ' , y: ' + this.activeElement.y + ' ]';
        } else if (this.activeElement instanceof Beam) {
            this.drawSelectedBeam(this.activeElement);
            let reactionValue = NaN;
            // console.log(this.staticCanvas.listOfReactions);
            this.staticCanvas.listOfReactions.forEach((reaction) => {
                if (
                    reaction.type === 'BEAM'
                    && reaction.referenceId === this.activeElement.id
                )
                    reactionValue = reaction.magnitude;
            });
            text = 'Beam: ' + this.activeElement.id + ' [ F: ' + reactionValue + ' ]';
        }

        //
        this.drawWordReal(10, this.canvasInstance.height - 30, text);
        //
        this.context.fillStyle = previousFillStyle;
    }

    // moving and zooming

    zoomIn(scale = 1.25) {
        this.w = Math.round(this.w * (1 / scale));
        this.Cx = Math.round(this.Cx * (1 / scale));

        this.h = Math.round(this.h * (1 / scale));
        this.Cy = Math.round(this.Cy * (1 / scale));

        this.ptInPx = this.canvasInstance.width / this.w;

        this.syncDimensionsBetweenCanvas();
        this.staticCanvas.drawSystem();
    }

    zoomOut(scale = 1.25) {
        this.w = Math.round(this.w * (scale));
        this.Cx = Math.round(this.Cx * (scale));

        this.h = Math.round(this.h * (scale));
        this.Cy = Math.round(this.Cy * (scale));

        this.ptInPx = this.canvasInstance.width / this.w;

        this.syncDimensionsBetweenCanvas();
        this.staticCanvas.drawSystem();
    }

    moveInX(x = 10) {
        this.Cx -= x;

        this.syncDimensionsBetweenCanvas();
        this.staticCanvas.drawSystem();
    }

    moveInY(y = 10) {
        this.Cy -= y;

        this.syncDimensionsBetweenCanvas();
        this.staticCanvas.drawSystem();
    }

    centerView() {
        this.Cx = Math.round(this.w / 2);
        this.Cy = Math.round(this.h / 2);

        this.syncDimensionsBetweenCanvas();
        this.staticCanvas.drawSystem();
    }

    syncDimensionsBetweenCanvas() {
        this.staticCanvas.w = this.w;
        this.staticCanvas.Cx = this.Cx;
        this.staticCanvas.h = this.h;
        this.staticCanvas.Cy = this.Cy;
        this.staticCanvas.ptInPx = this.ptInPx;
    }

    // Actions

    print() {
        this.backgroundCanvas.context.drawImage(this.staticCanvas.canvasInstance, 0, 0);
        this.backgroundCanvas.context.drawImage(this.canvasInstance, 0, 0);
        let canvasUrl = this.backgroundCanvas.canvasInstance.toDataURL();
        window.open(canvasUrl, '_blank');
        this.backgroundCanvas.paintBackground();
    }

    setupEvents() {
        this.canvasInstance.addEventListener('mousemove', e => {
            this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
            this.canvasInstance.tabIndex = 0;
            this.canvasInstance.focus();

            if (this.mouseMode === 'free') {
                this.checkIfMouseOnTopOfNode(e.offsetX, e.offsetY);

                if (this.activeElement === null || this.activeElement instanceof Beam)
                    this.checkIfMouseOnTopOfBeam(e.offsetX, e.offsetY);
            } else if (this.mouseMode === 'movingNode') {

                let nodeBeingMoved = this.staticSystem.data.nodes[this.activeElement.id];
                nodeBeingMoved.x = this.xPxToPt(e.offsetX);
                nodeBeingMoved.y = this.yPxToPt(e.offsetY);
                this.updateSystemJson(this.staticSystem.data);

            } else if (this.mouseMode === 'movingCanvas') {
                let previousStrokeStyle = this.context.strokeStyle;

                this.context.strokeStyle = 'red';

                this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
                this.drawLineReal(this.referencePoint.x, this.referencePoint.y, e.offsetX, e.offsetY);

                this.context.strokeStyle = previousStrokeStyle;
            } else if (this.mouseMode === 'creating-node') {
                //
            } else if (this.mouseMode === 'creating-beam') {
                this.checkIfMouseOnTopOfNode(e.offsetX, e.offsetY);
            } else if (this.mouseMode === 'deleting-element') {
                this.checkIfMouseOnTopOfNode(e.offsetX, e.offsetY);

                if (this.activeElement === null || this.activeElement instanceof Beam)
                    this.checkIfMouseOnTopOfBeam(e.offsetX, e.offsetY);
            }

            this.updateActionInfo();
            this.drawCoordinatePosition('pointer', e.offsetX, e.offsetY);
        });

        this.canvasInstance.addEventListener('wheel', e => {
            let zoomingIn = e.deltaY > 0;

            if (zoomingIn) {
                this.zoomIn();

                let displacement = Math.round(this.w / 10);

                let width = this.canvasInstance.width;
                let height = this.canvasInstance.height;

                let wheelX = e.offsetX;
                let wheelY = e.offsetY;

                if (wheelX > (width * (2 / 3)))
                    this.moveInX(displacement);
                if (wheelX < (width * (1 / 3)))
                    this.moveInX(-displacement);

                if (wheelY < (height * (1 / 3)))
                    this.moveInY(displacement);

                if (wheelY > (height * (2 / 3)))
                    this.moveInY(-displacement);
            } else {
                this.zoomOut();
            }
        });

        this.canvasInstance.addEventListener('mousedown', e => {

            if (this.mouseMode === 'free') {
                let whichMouse = e.button;
                if (whichMouse === 0) {//left click
                    if (this.activeElement !== null) {
                        if (this.activeElement instanceof Node)
                            this.mouseMode = 'movingNode';
                        // console.log('movingNode');
                    }
                } else if (whichMouse === 1) {//wheel pressed
                    this.referencePoint = {x: e.offsetX, y: e.offsetY};
                    this.mouseMode = 'movingCanvas';
                }
            } else if (this.mouseMode === 'creating-node') {
                let newNodeName = this.staticSystem.generateCandidateNewNodeName();

                let x = this.xPxToPt(e.offsetX);
                let y = this.yPxToPt(e.offsetY);

                let nodeName = prompt('Enter name for new Node [x: ' + x + ' , y:' + y + ' ]', newNodeName);

                if (nodeName !== null) {
                    this.staticSystem.data.nodes[nodeName] = {
                        x: x,
                        y: y,
                        type: 'JOINT'
                    };

                    this.updateSystemJson(this.staticSystem.data);
                }
            } else if (this.mouseMode === 'creating-beam') {

                if (this.activeElement !== null && this.activeElement instanceof Node) {
                    if (this.beamCreation.n1 === null) {
                        this.beamCreation.n1 = this.activeElement;
                    } else if (this.beamCreation.n2 === null && this.beamCreation.n1.id !== this.activeElement.id) {
                        this.beamCreation.n2 = this.activeElement;
                        let newBeamName = this.generateStandardBeanName() ?? this.staticSystem.generateCandidateNewBeamName();

                        let beamName = prompt(
                            'Enter name for new Beam [startNode: ' + this.beamCreation.n1.id
                            + ' , endNode:' + this.beamCreation.n2.id + ' ]'
                            , newBeamName);

                        if (beamName !== null) {
                            this.staticSystem.data.beams[beamName] = {
                                startNode: this.beamCreation.n1.id,
                                endNode: this.beamCreation.n2.id
                            };

                            this.updateSystemJson(this.staticSystem.data);
                        }

                    }
                }

            } else if (this.mouseMode === 'deleting-element') {

                if (this.activeElement !== null) {

                    let elementType = this.activeElement instanceof Beam ?
                        'BEAM' :
                        (this.activeElement instanceof Node ? 'NODE' : 'UNKNOWN');

                    if (confirm('Are you sure you want to delete the ' + elementType + ' [ ' + this.activeElement.id + ' ]')) {

                        if (this.activeElement instanceof Beam)
                            delete this.staticSystem.data.beams[this.activeElement.id];
                        else if (this.activeElement instanceof Node)
                            delete this.staticSystem.data.nodes[this.activeElement.id];

                        this.staticCanvas.resetReactions();
                        this.updateSystemJson(this.staticSystem.data);
                        this.mouseMode = 'free';
                    } else {
                        // Do nothing
                    }
                }
            }
            this.updateCursor();
        });

        this.canvasInstance.addEventListener('mouseup', e => {
            if (this.mouseMode === 'movingNode') {
                this.mouseMode = 'free';
            } else if (this.mouseMode === 'movingCanvas') {
                this.moveInX(this.xPxToPt(this.referencePoint.x) - this.xPxToPt(e.offsetX));
                this.moveInY(this.yPxToPt(this.referencePoint.y) - this.yPxToPt(e.offsetY));
                this.referencePoint = {};
                this.mouseMode = 'free';
            } else if (this.mouseMode === 'creating-node') {
                this.mouseMode = 'free';
            } else if (this.mouseMode === 'creating-beam') {
                if (this.beamCreation.n1 !== null && this.beamCreation.n2 !== null) {
                    this.mouseMode = 'free';
                    this.beamCreation = {n1: null, n2: null};
                }
            }
            this.updateCursor();
        });

        this.canvasInstance.addEventListener('keydown', (e) => {
            let displacement = Math.round(this.w / 10);

            if (e.key === '27') {//esc
                this.mouseMode = 'free';
                this.beamCreation = {n1: null, n2: null};
                this.updateCursor();
            } else if (e.key === '37') {//arrow left
                this.moveInX(displacement);
            } else if (e.key === '38') {//arrow dup
                this.moveInY(-displacement);
            } else if (e.key === '39') {//arrow right
                this.moveInX(-displacement);
            } else if (e.key === '40') {//arrow down
                this.moveInY(displacement);
            } else if (e.key === '66') {//b: beam
                // console.log('BEAM');
                this.mouseMode = 'creating-beam';
                this.updateCursor();
            } else if (e.key === '67') {//c: center
                this.centerView();
            } else if (e.key === '68') {//d: delete
                this.mouseMode = 'deleting-element';
                this.updateCursor();
            } else if (e.key === '73') {//i: in
                this.zoomIn();
            } else if (e.key === '78') {//n: node
                // console.log('NODE');
                this.mouseMode = 'creating-node';
                this.updateCursor();
            } else if (e.key === '79') {//o: out
                this.zoomOut();
            } else if (e.key === '80') {//p: print
                this.print();
            } else if (e.key === '83') {//s: save current file (update)
                this.fileManager.updateCurrentStaticSystem(this.staticSystem.data);
            } else if (e.key === '85') {//u: upload new file
                let fileName = prompt("Enter file name to upload", "Mechanism_" + Math.floor(Date.now() / 1000));
                this.fileManager.uploadStaticSystem(this.staticSystem.data, fileName);
            }
        });
    }

    updateSystemJson(json) {
    }

    checkIfMouseOnTopOfNode(x, y) {
        this.highlightActiveElement();
        for (let nodeId in this.staticSystem.nodes) {
            let node = this.staticSystem.nodes[nodeId];

            if (
                Geometry.pointIsOnPoint(this.xPtToPx(node.x), this.yPtToPx(node.y), x, y)
            ) {
                this.activeElement = node;
                this.highlightActiveElement();
                return;
            }
        }
        this.activeElement = null;
    }

    checkIfMouseOnTopOfBeam(x, y) {
        this.highlightActiveElement();
        for (let beamId in this.staticSystem.beams) {
            let beam = this.staticSystem.beams[beamId];

            if (
                Geometry.pointIsInLineBetweenPoints(
                    x, y,
                    this.xPtToPx(beam.startNode.x), this.yPtToPx(beam.startNode.y),
                    this.xPtToPx(beam.endNode.x), this.yPtToPx(beam.endNode.y),
                )
            ) {
                this.activeElement = beam;
                this.highlightActiveElement();
                return;
            }
        }
        this.activeElement = null;
    }

    updateCursor() {
        let cursorStyle = 'default';
        if (this.mouseMode === 'free') {

            if (this.activeElement === null)
                cursorStyle = 'default';
            else if (this.activeElement instanceof Node)
                cursorStyle = 'grab';
            else if (this.activeElement instanceof Beam)
                cursorStyle = 'help';

        } else if (this.mouseMode === 'movingNode') {
            cursorStyle = 'grabbing';
        } else if (this.mouseMode === 'movingCanvas') {
            cursorStyle = 'move';
        } else if (this.mouseMode === 'creating-node') {
            cursorStyle = 'crosshair';
        } else if (this.mouseMode === 'creating-beam') {
            cursorStyle = 'crosshair';
        } else if (this.mouseMode === 'deleting-element') {
            cursorStyle = 'not-allowed';
        }

        this.canvasInstance.style.cursor = cursorStyle;
    }

    updateActionInfo() {
        if (this.mouseMode === 'creating-node') {
            this.writeActionInfo('Creating Node');
        } else if (this.mouseMode === 'creating-beam') {

            if (this.beamCreation.n1 === null)
                this.writeActionInfo('Creating Beam [Select startNode]');
            else if (this.beamCreation.n2 === null)
                this.writeActionInfo('Creating Beam [Select endNode]');

        }
    }

    writeActionInfo(text) {
        let previousFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'darkcyan';

        // this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);

        this.drawWordReal(10, this.canvasInstance.height - 60, 'Action: [ ' + text + ' ]');

        this.context.fillStyle = previousFillStyle;
    }

    // Drawing

    drawSelectedBeam(beam) {
        let previousStrokeStyle = this.context.strokeStyle;
        let previousLineWidth = this.context.lineWidth;

        this.context.strokeStyle = '#00ff0022';
        this.context.lineWidth = 10;

        this.drawLine(
            beam.startNode.x,
            beam.startNode.y,
            beam.endNode.x,
            beam.endNode.y
        )

        this.context.strokeStyle = previousStrokeStyle;
        this.context.lineWidth = previousLineWidth;
    }

    drawSelectedNode(node) {
        let previousFillStyle = this.context.fillStyle;
        let previousStrokeStyle = this.context.strokeStyle;

        this.context.strokeStyle = '#00ff0022';
        this.context.fillStyle = '#00ff0022';

        this.drawFilledCircle(node.x, node.y, 3);

        this.context.strokeStyle = previousStrokeStyle;
        this.context.fillStyle = previousFillStyle;
    }

    /**
     *
     * @returns {undefined|string}
     */
    generateStandardBeanName() {
        const {n1, n2} = this.beamCreation;
        if (
            n1 === undefined
            || n2 === undefined
            || !this.isStandardNodeName(n1.id)
            || !this.isStandardNodeName(n2.id)
        ) {
            return undefined;
        }

        return `b${n1.id.replace('n', '')}-${n2.id.replace('n', '')}`
    }

    isStandardNodeName(nodeId) {
        return /^n\d+$/.test(nodeId)
    }
}

export default DynamicCanvas;