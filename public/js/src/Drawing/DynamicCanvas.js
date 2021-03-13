import BackgroundCanvas from "./BackgroundCanvas.js";
import BaseCanvas from "./BaseCanvas.js";
import StaticCanvas from "./StaticCanvas.js";
import StaticSystem from "../Core/StaticSystem.js";

class DynamicCanvas extends BaseCanvas {
    _staticSystem;
    _staticCanvas;
    _backgroundCanvas;
    mouseMode = 'free';
    activeElement = null;

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

    drawCoordinatePosition(word, x, y) {
        let previousStrokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = 'black';
        let text = word + ' ( ' + this.xPxToPt(x) + ' , ' + this.yPxToPt(y) + ' )';

        this.context.clearRect(10, this.canvasInstance.height - 20, this.canvasInstance.width / 2, 20);

        this.drawWordReal(10, this.canvasInstance.height - 10, text);

        this.context.strokeStyle = previousStrokeStyle;
    }

    highlightActiveElement() {
        let previousStrokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = 'magenta';

        this.context.clearRect(10, this.canvasInstance.height - 40, this.canvasInstance.width / 2, 20);

        if (this.activeElement === null)
            return;

        let text = 'Active Element: ' + this.activeElement.id;

        //
        this.drawWordReal(10, this.canvasInstance.height - 30, text);
        //
        this.context.strokeStyle = previousStrokeStyle;
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
        this.context.drawImage(this._backgroundCanvas.canvasInstance, 0, 0);
        this.context.drawImage(this._staticCanvas.canvasInstance, 0, 0);
        let canvasUrl = this.canvasInstance.toDataURL();
        console.log(canvasUrl);
        window.open(canvasUrl,'_blank');
    }

    setupEvents() {
        this.canvasInstance.addEventListener('mousemove', e => {
            this.canvasInstance.tabIndex = 0;
            this.canvasInstance.focus();
            this.drawCoordinatePosition('pointer', e.offsetX, e.offsetY);

            if (this.mouseMode === 'free') {
                this.checkIfMouseOnTopOfElement(e.offsetX, e.offsetY);
            } else if (this.mouseMode === 'movingNode') {
                // console.log('movingNode ' + this.activeElement.id + ' to ' + 'X: ' + e.offsetX + 'px' + 'Y: ' + e.offsetY + 'px'+
                //
                // '. this is '+
                //     'X: ' + this.xPxToPt(e.offsetX) + 'pt' + 'Y: ' + this.yPxToPt(e.offsetY) + 'pt'
                // );

                let nodeBeingMoved = this._staticSystem.data.nodes[this.activeElement.id];
                nodeBeingMoved.x = this.xPxToPt(e.offsetX);
                nodeBeingMoved.y = this.yPxToPt(e.offsetY);
                this.updateSystemJson(this._staticSystem.data);

            }
        });

        this.canvasInstance.addEventListener('mousedown', e => {
            // console.log(e);
            if (this.mouseMode === 'free') {
                if (this.activeElement !== null) {
                    this.mouseMode = 'movingNode';
                    // console.log('movingNode');
                }
            }
        });

        this.canvasInstance.addEventListener('mouseup', e => {
            if (this.mouseMode === 'movingNode') {
                this.mouseMode = 'free';
            }
        });

        this.canvasInstance.addEventListener('keydown', (e) => {
            let displacement = Math.round(this.w / 10);
            switch (e.keyCode) {
                case 37://arrow left
                    this.moveInX(displacement);
                    break;
                case 38://arrow dup
                    this.moveInY(-displacement);
                    break;
                case 39://arrow right
                    this.moveInX(-displacement);
                    break;
                case 40://arrow down
                    this.moveInY(displacement);
                    break;
                case 67://c: center
                    this.centerView();
                    break;
                case 73://i: in
                    this.zoomIn();
                    break;
                case 79://o: out
                    this.zoomOut();
                    break;
                case 80://p: print
                    this.print();
                    break;

            }
        });
    }

    updateSystemJson(json) {
    }

    checkIfMouseOnTopOfElement(x, y) {
        this.highlightActiveElement();
        for (let nodeId in this._staticSystem.nodes) {
            let node = this._staticSystem.nodes[nodeId];
            let leeway = 5;

            if (
                Math.abs(this.xPtToPx(node.x) - x) < leeway
                && Math.abs(this.yPtToPx(node.y) - y) < leeway
            ) {
                this.activeElement = node;
                this.highlightActiveElement();
                return;
            }
        }
        this.activeElement = null;
    }
}

export default DynamicCanvas;