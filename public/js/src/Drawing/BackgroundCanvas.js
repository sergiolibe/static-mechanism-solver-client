import BaseCanvas from "./BaseCanvas.js";

class BackgroundCanvas extends BaseCanvas {

    /**
     * @param {string} canvasNodeId
     */
    constructor(canvasNodeId) {
        super(canvasNodeId);

        this.paintBackground()
    }

    paintBackground(backgroundColor = '#f8f8ff') {

        let previousFillStyle = this.context.fillStyle;

        this.context.fillStyle = backgroundColor;
        this.fillRectReal(0, 0, this.canvasInstance.width, this.canvasInstance.height);

        this.context.fillStyle = previousFillStyle;

    }
}

export default BackgroundCanvas;