import BackgroundCanvas from "./BackgroundCanvas.js";
import BaseCanvas from "./BaseCanvas.js";
import Beam from "./../Core/Beam.js";
import FileManager from "./../Communication/FileManager.js";
import Geometry from "./../Utils/Geometry.js";
import Node from "./../Core/Node.js";
import StaticCanvas from "./StaticCanvas.js";
import StaticSystem from "./../Core/StaticSystem.js";

class DynamicCanvas extends BaseCanvas {
    _staticSystem;
    _staticCanvas;
    _backgroundCanvas;
    _fileManager;
    mouseMode = 'free';
    activeElement = null;
    referencePoint = {};

    constructor(canvasNodeId) {
        super(canvasNodeId);
        this.setupEvents();
    }

    set staticSystem(staticSystem) {
        if (staticSystem instanceof StaticSystem)
            this._staticSystem = staticSystem;
        else
            throw new Error('Expected instance of StaticSystem, get: ' + staticSystem)
    }

    set staticCanvas(staticCanvas) {
        if (staticCanvas instanceof StaticCanvas)
            this._staticCanvas = staticCanvas;
        else
            throw new Error('Expected instance of StaticCanvas, get: ' + staticCanvas)
    }

    set backgroundCanvas(backgroundCanvas) {
        if (backgroundCanvas instanceof BackgroundCanvas)
            this._backgroundCanvas = backgroundCanvas;
        else
            throw new Error('Expected instance of BackgroundCanvas, get: ' + backgroundCanvas)
    }

    set fileManager(fileManager) {
        if (fileManager instanceof FileManager)
            this._fileManager = fileManager;
        else
            throw new Error('Expected instance of FileManager, get: ' + fileManager)
    }

    drawCoordinatePosition(word, x, y) {
        let previousFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'black';
        let text = word + ' ( ' + this.xPxToPt(x) + ' , ' + this.yPxToPt(y) + ' )';

        this.context.clearRect(10, this.canvasInstance.height - 20, this.canvasInstance.width / 2, 20);

        this.drawWordReal(10, this.canvasInstance.height - 10, text);

        this.context.fillStyle = previousFillStyle;
    }

    highlightActiveElement() {
        this.updateCursor();
        let previousFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'magenta';

        this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);

        if (this.activeElement === null)
            return;

        let text = '<>';
        if (this.activeElement instanceof Node) {
            this.drawSelectedNode(this.activeElement);
            text = 'Node: ' + this.activeElement.id + ' [ x: ' + this.activeElement.x + ' , y: ' + this.activeElement.y + ' ]';
        } else if (this.activeElement instanceof Beam) {
            this.drawSelectedBeam(this.activeElement);
            let reactionValue = NaN;
            // console.log(this._staticCanvas.listOfReactions);
            this._staticCanvas.listOfReactions.forEach((reaction) => {
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
        this._staticCanvas.drawSystem();
    }

    zoomOut(scale = 1.25) {
        this.w = Math.round(this.w * (scale));
        this.Cx = Math.round(this.Cx * (scale));

        this.h = Math.round(this.h * (scale));
        this.Cy = Math.round(this.Cy * (scale));

        this.ptInPx = this.canvasInstance.width / this.w;

        this.syncDimensionsBetweenCanvas();
        this._staticCanvas.drawSystem();
    }

    moveInX(x = 10) {
        this.Cx -= x;

        this.syncDimensionsBetweenCanvas();
        this._staticCanvas.drawSystem();
    }

    moveInY(y = 10) {
        this.Cy -= y;

        this.syncDimensionsBetweenCanvas();
        this._staticCanvas.drawSystem();
    }

    centerView() {
        this.Cx = Math.round(this.w / 2);
        this.Cy = Math.round(this.h / 2);

        this.syncDimensionsBetweenCanvas();
        this._staticCanvas.drawSystem();
    }

    syncDimensionsBetweenCanvas() {
        this._staticCanvas.w = this.w;
        this._staticCanvas.Cx = this.Cx;
        this._staticCanvas.h = this.h;
        this._staticCanvas.Cy = this.Cy;
        this._staticCanvas.ptInPx = this.ptInPx;
    }

    // Actions

    print() {
        this._backgroundCanvas.context.drawImage(this._staticCanvas.canvasInstance, 0, 0);
        this._backgroundCanvas.context.drawImage(this.canvasInstance, 0, 0);
        let canvasUrl = this._backgroundCanvas.canvasInstance.toDataURL();
        window.open(canvasUrl, '_blank');
        this._backgroundCanvas.paintBackground();
    }

    setupEvents() {
        this.canvasInstance.addEventListener('mousemove', e => {
            this.canvasInstance.tabIndex = 0;
            this.canvasInstance.focus();

            if (this.mouseMode === 'free') {
                this.checkIfMouseOnTopOfElement(e.offsetX, e.offsetY);

                if (this.activeElement === null || this.activeElement instanceof Beam)
                    this.checkIfMouseOnTopBeam(e.offsetX, e.offsetY);
            } else if (this.mouseMode === 'movingNode') {

                let nodeBeingMoved = this._staticSystem.data.nodes[this.activeElement.id];
                nodeBeingMoved.x = this.xPxToPt(e.offsetX);
                nodeBeingMoved.y = this.yPxToPt(e.offsetY);
                this.updateSystemJson(this._staticSystem.data);

            } else if (this.mouseMode === 'movingCanvas') {
                let previousStrokeStyle = this.context.strokeStyle;

                this.context.strokeStyle = 'red';

                this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
                this.drawLineReal(this.referencePoint.x, this.referencePoint.y, e.offsetX, e.offsetY);

                this.context.strokeStyle = previousStrokeStyle;
            }

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

                if (wheelX > (width * 2 / 3))
                    this.moveInX(displacement);
                if (wheelX < (width * 1 / 3))
                    this.moveInX(-displacement);

                if (wheelY < (height * 1 / 3))
                    this.moveInY(displacement);

                if (wheelY > (height * 2 / 3))
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
            }
            this.updateCursor();
        });

        this.canvasInstance.addEventListener('keydown', (e) => {
            let displacement = Math.round(this.w / 10);

            if (e.keyCode === 37) {//arrow left
                this.moveInX(displacement);
            } else if (e.keyCode === 38) {//arrow dup
                this.moveInY(-displacement);
            } else if (e.keyCode === 39) {//arrow right
                this.moveInX(-displacement);
            } else if (e.keyCode === 40) {//arrow down
                this.moveInY(displacement);
            } else if (e.keyCode === 67) {//c: center
                this.centerView();
            } else if (e.keyCode === 73) {//i: in
                this.zoomIn();
            } else if (e.keyCode === 79) {//o: out
                this.zoomOut();
            } else if (e.keyCode === 80) {//p: print
                this.print();
            } else if (e.keyCode === 83) {//s: save current file (update)
                this._fileManager.updateCurrentStaticSystem(this._staticSystem.data);
            } else if (e.keyCode === 85) {//u: upload new file
                let fileName = prompt("Enter file name to upload", "Mechanism_" + Math.floor(Date.now() / 1000));
                this._fileManager.uploadStaticSystem(this._staticSystem.data, fileName);
            }
        });
    }

    updateSystemJson(json) {
    }

    checkIfMouseOnTopOfElement(x, y) {
        this.highlightActiveElement();
        for (let nodeId in this._staticSystem.nodes) {
            let node = this._staticSystem.nodes[nodeId];

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

    checkIfMouseOnTopBeam(x, y) {
        this.highlightActiveElement();
        for (let beamId in this._staticSystem.beams) {
            let beam = this._staticSystem.beams[beamId];

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
        }

        this.canvasInstance.style.cursor = cursorStyle;
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
}

export default DynamicCanvas;