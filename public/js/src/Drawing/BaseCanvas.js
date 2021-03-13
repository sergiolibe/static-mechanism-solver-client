class BaseCanvas {
    w = 150;
    h = 150;
    Cx = 30;
    Cy = 120;
    canvasNodeId;
    canvasInstance;
    // dynamicCanvas;
    // staticContext;
    // ptInPx;
    // staticSystem={};
    // listOfReactions={};
    // maxTension;
    // maxCompression;
    // mouseMode = 'free';
    // activeElement=null;

    constructor(canvasNodeId) {
        this.canvasNodeId = canvasNodeId;
        this.canvasInstance = document.getElementById(canvasNodeId);
        let canvasContainer = this.canvasInstance.parentElement;
        this.context = this.canvasInstance.getContext('2d');
        this.canvasInstance.width = canvasContainer.clientWidth;
        this.canvasInstance.height = canvasContainer.clientHeight;
        this.context.font = "12px Arial";

        this.ptInPx = this.canvasInstance.width / this.w;
        // this.drawGuidelines();
        // this.setupEvents();
    }

    // draw

    cleanCanvas() {
        this.context.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
    }

    drawLine(x, y, xf, yf) {
        this.context.beginPath();
        this.context.moveTo(this.xPtToPx(x), this.yPtToPx(y));
        this.context.lineTo(this.xPtToPx(xf), this.yPtToPx(yf));
        this.context.stroke();
    }

    drawArrow(x, y, xf, yf) {
        this.drawLine(x, y, xf, yf);

        let angle = Math.atan2(y - yf, x - xf);

        let lengthArrow = 2;
        let angleDiff = .5;
        this.drawLine(
            xf, yf,
            xf + lengthArrow * Math.cos(angle + angleDiff),
            yf + lengthArrow * Math.sin(angle + angleDiff)
        );

        this.drawLine(
            xf, yf,
            xf + lengthArrow * Math.cos(angle - angleDiff),
            yf + lengthArrow * Math.sin(angle - angleDiff)
        );

    }

    fillRect(x, y, w, h) {
        let xT = this.xPtToPx(x);
        let yT = this.yPtToPx(y + h);
        let wT = this.ptToPx(w);
        let hT = this.ptToPx(h);

        this.context.fillRect(xT, yT, wT, hT);
    }

    fillRectReal(x, y, w, h) {
        this.context.fillRect(x, y, w, h);
    }

    drawCircle(x, y, r) {
        this.context.beginPath();
        this.context.arc(this.xPtToPx(x), this.yPtToPx(y), this.ptToPx(r), 0, 2 * Math.PI);
        this.context.stroke();
    }

    drawFilledCircle(x, y, r) {
        this.context.beginPath();
        this.context.arc(this.xPtToPx(x), this.yPtToPx(y), this.ptToPx(r), 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
    }

    drawWord(x, y, text) {
        this.context.fillText(text, this.xPtToPx(x), this.yPtToPx(y));
    }

    drawWordReal(x, y, text) {
        this.context.fillText(text, x, y);
    }

    // conversion

    xPtToPx(xPt) {
        return this.ptToPx(this.Cx + xPt);
    }

    xPxToPt(xPx) {
        return this.pxToPt(xPx)-this.Cx;
    }

    yPtToPx(yPt) {
        return this.ptToPx(this.h - this.Cy - yPt);
    }

    yPxToPt(yPx) {
        return this.h - this.Cy - this.pxToPt(yPx);
    }

    ptToPx(pt) {
        return Math.round(this.ptInPx * pt);
    }

    pxToPt(px) {
        return Math.round(px / this.ptInPx);
    }
}

export default BaseCanvas;