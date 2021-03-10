"use strict";

class Canvas {
    w = 150;
    h = 150;
    Cx = 30;
    Cy = 120;
    canvasNodes;
    staticCanvas;
    dynamicCanvas;
    staticContext;
    ptInPx;
    staticSystem={};
    listOfReactions={};
    maxTension;
    maxCompression;

    constructor(canvasNodes) {
        this.canvasNodes = canvasNodes;
        this.staticCanvas = document.getElementById(canvasNodes.static);
        this.dynamicCanvas = document.getElementById(canvasNodes.dynamic);
        let canvasContainer = this.staticCanvas.parentElement;
        this.staticContext = this.staticCanvas.getContext('2d');
        this.staticCanvas.width = canvasContainer.clientWidth;
        this.staticCanvas.height = canvasContainer.clientHeight;
        this.staticContext.font = "12px Arial";

        this.dynamicContext = this.dynamicCanvas.getContext('2d');
        this.dynamicCanvas.width = canvasContainer.clientWidth;
        this.dynamicCanvas.height = canvasContainer.clientHeight;
        this.dynamicContext.font = "12px Arial";

        this.ptInPx = this.staticCanvas.width / this.w;
        this.drawGuidelines();
        this.setupEvents();
    }

    // draw

    drawGuidelines() {
        let previousStrokeStyle = this.staticContext.strokeStyle;

        this.staticContext.strokeStyle = 'black';
        this.drawLine(-1, 0, +1, 0);
        this.drawLine(0, -1, 0, +1);

        this.staticContext.strokeStyle = 'rgba(123, 123, 123,0.5)';
        this.drawLine(-this.Cx + 1, 0, this.w - this.Cx - 1, 0);
        this.drawLine(0, -this.Cy + 1, 0, this.h - this.Cy - 1);
        this.staticContext.strokeStyle = previousStrokeStyle;
    }

    cleanCanvas() {
        this.staticContext.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

        let previousFillStyle = this.staticContext.fillStyle;
        this.staticContext.fillStyle = 'white';
        this.staticContext.fillRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);
        this.staticContext.fillStyle = previousFillStyle;
    }

    drawLine(x, y, xf, yf) {
        this.staticContext.beginPath();
        this.staticContext.moveTo(this.xPtToPx(x), this.yPtToPx(y));
        this.staticContext.lineTo(this.xPtToPx(xf), this.yPtToPx(yf));
        this.staticContext.stroke();
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

        this.staticContext.fillRect(xT, yT, wT, hT);
    }

    drawSystem(staticSystem= null) {
        if (staticSystem !== null) {
            this.staticSystem = staticSystem;
            this.listOfReactions = {};
            this.maxTension = -1;
            this.maxTension = 1;
        }
        // console.log(staticSystem);
        this.cleanCanvas();
        this.drawGuidelines();

        Object.values(this.staticSystem.beams)
            .forEach((beam) => this.drawBeam(beam));

        Object.values(this.staticSystem.nodes)
            .forEach((node) => this.drawNode(node));

        Object.values(this.staticSystem.forces)
            .forEach((force) => this.drawForce(force));

        if (Object.keys(this.listOfReactions).length>0)
            this.drawReactions();
    }

    drawReactions(listOfReactions=null) {
        if (listOfReactions !== null) {
            this.listOfReactions = listOfReactions;
            this.maxTension = -1;
            this.maxCompression = 1;
            this.listOfReactions.forEach((reaction) => {
                // console.log('checking reaction: ',{maxTension:this.maxTension,maxCompression:this.maxCompression,rMagnitude:reaction.magnitude});
                if (reaction.magnitude > 0) {
                    this.maxTension = reaction.magnitude > this.maxTension ?
                        reaction.magnitude :
                        this.maxTension;
                } else {
                    this.maxCompression = reaction.magnitude < this.maxCompression ?
                        reaction.magnitude :
                        this.maxCompression;
                }
            })
        }

        let previousStrokeStyle = this.staticContext.strokeStyle;
        let previousLineWidth = this.staticContext.lineWidth;

        this.staticContext.lineWidth = 2;
        // console.log(listOfReactions);
        this.listOfReactions.forEach((reaction) => {
            if (reaction.type === 'U1' || reaction.type === 'U2') {
                let nodeName = reaction.referenceId;
                // let axis = reaction.substr(-1, 1);
                let magnitude = reaction.magnitude;
                this.staticContext.strokeStyle = magnitude > 0 ? 'blue' : 'red';
                // this.context.strokeStyle = this.getInterpolatedReactionColor(magnitude);

                let node = this.staticSystem.getNodeById(nodeName);

                let length = 20;
                if (reaction.type === 'U2') {
                    if (magnitude > 0) {
                        this.drawArrow(node.x, node.y - length, node.x, node.y);
                    } else {
                        this.drawArrow(node.x, node.y, node.x, node.y - length);
                    }
                    this.drawWord(node.x, node.y - length, reaction.symbol + ' = ' + magnitude);
                } else {
                    if (magnitude > 0) {
                        this.drawArrow(node.x - length, node.y, node.x, node.y);
                    } else {
                        this.drawArrow(node.x, node.y, node.x - length, node.y);
                    }
                    this.drawWord(node.x - length, node.y, reaction.symbol + ' = ' + magnitude);
                }

            } else if (reaction.type === 'FORCE') {
                let forceName = reaction.referenceId;
                let magnitude = reaction.magnitude;
                // this.context.strokeStyle = this.getInterpolatedReactionColor(magnitude);
                this.staticContext.strokeStyle = 'green';

                let force = this.staticSystem.getForceById(forceName);

                let length = 10;
                // let radAngle = reaction.radAngle;
                let head = {x: force.node.x, y: force.node.y};
                let tail = {};
                if (magnitude > 0) {
                    tail = {x: head.x - length * reaction.cos, y: head.y - length * reaction.sin};
                } else {
                    tail = {x: head.x + length * reaction.cos, y: head.y + length * reaction.sin};
                }
                this.drawArrow(tail.x, tail.y, head.x, head.y);
                this.drawWord(tail.x, tail.y, reaction.symbol + ' = ' + magnitude);
            } else if (reaction.type === 'BEAM') {
                let beamName = reaction.referenceId;
                let magnitude = reaction.magnitude;
                // this.context.strokeStyle = magnitude > 0 ? 'cyan' : 'darkred';
                this.staticContext.strokeStyle = this.getInterpolatedReactionColor(magnitude);

                let beam = this.staticSystem.getBeamById(beamName);

                this.drawLine(beam.startNode.x, beam.startNode.y, beam.endNode.x, beam.endNode.y);
            }

        });
        this.staticContext.strokeStyle = previousStrokeStyle;
        this.staticContext.lineWidth = previousLineWidth;
        this.drawGradient();
    }

    drawGradient() {
        let previousFillStyle = this.staticContext.fillStyle;
        // let gradient = this.context.createLinearGradient(0, 0, this.canvas.width/2, 0);

        let gradientX0 = this.staticCanvas.width / 4;
        let gradientW = this.staticCanvas.width / 2;
        let gradientY0 = this.staticCanvas.height - 30;
        let gradientH = 20;

        let gradient = this.staticContext.createLinearGradient(gradientX0, 0, gradientX0+gradientW, 0);
        gradient.addColorStop(0,this.interpolateColor(0));
        gradient.addColorStop(0.49,this.interpolateColor(0.49));
        gradient.addColorStop(0.5,this.interpolateColor(0.5));
        gradient.addColorStop(0.51,this.interpolateColor(0.51));
        gradient.addColorStop(1,this.interpolateColor(1));

        this.staticContext.fillStyle = gradient;
        this.staticContext.fillRect(gradientX0, gradientY0, gradientW, gradientH);
        this.staticContext.fillStyle = previousFillStyle;

        this.drawWordReal(gradientX0, gradientY0-10, this.maxCompression);
        this.drawWordReal(gradientX0+gradientW/2, gradientY0-10, 0);
        this.drawWordReal(gradientX0+gradientW, gradientY0-10, this.maxTension);

    }

    getInterpolatedReactionColor(magnitude){
        let value = (magnitude-this.maxCompression)/(this.maxTension-this.maxCompression);
        return this.interpolateColor(value);
    }

    interpolateColor(value) {
        let colors = {
            "red": {value:0, arrayColor:[255,0,0]},
            "yellow": {value:0.49, arrayColor:[255,255,0]},
            "black": {value:0.5, arrayColor:[0,0,0]},
            "cyan": {value:0.51, arrayColor:[0,255,255]},
            "blue": {value:1, arrayColor:[0,0,255]}
        };

        let colorNames = Object.keys(colors)

        let colorLeft = [];
        let colorRight = [];

        for (let color of colorNames){
            //console.log('interpolateColor: ',{value:value,color:color});
            let colorInfo = colors[color];
            colorRight = colorInfo.arrayColor;
            if (value===colorInfo.value){
                //console.log('value = colorValue', {value:value,colorValue:colorInfo.value});
                return this.arrayColorToRgb(colorInfo.arrayColor);
            } else if (value>colorInfo.value) {
                //console.log('value > colorValue', {value:value,colorValue:colorInfo.value});
                colorLeft = colorInfo.arrayColor;
                // return this.arrayColorToRgb(colorInfo.arrayColor);
            } else {
                //console.log('value < colorValue', {value:value,colorValue:colorInfo.value});
                break;
            }
        }

        return this.mapColor(colorLeft, colorRight, value);
    }

    arrayColorToRgb(color) {
        // console.log('arrayColorToRgb',color);
        return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    }

    mapColor(color1, color2, weight) {
        //console.log('mapping color',{color1:color1,color2:color2,});

        let w1 = weight;
        let w2 = 1 - w1;

        return this.arrayColorToRgb([
            Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)
        ]);
    }


    drawCoordinatePosition(word,x,y){
        let previousStrokeStyle = this.dynamicContext.strokeStyle;
        this.dynamicContext.strokeStyle = 'black';
        let text = word + ' ( ' + this.xPxToPt(x) + ' , ' + this.yPxToPt(y) + ' )';

        this.dynamicContext.clearRect(10, this.dynamicCanvas.height-20, this.dynamicCanvas.width/2, 20);

        this.dynamicContext.fillText(text, 10, this.dynamicCanvas.height-10);

        this.dynamicContext.strokeStyle = previousStrokeStyle;
    }

    drawBeam(beam) {
        let previousStrokeStyle = this.staticContext.strokeStyle;
        this.staticContext.strokeStyle = 'black';
        this.drawLine(
            beam.startNode.x,
            beam.startNode.y,
            beam.endNode.x,
            beam.endNode.y
        )

        this.drawWord(-2 + (beam.startNode.x + beam.endNode.x) / 2, -2 + (beam.startNode.y + beam.endNode.y) / 2, beam.id);

        this.staticContext.strokeStyle = previousStrokeStyle;
    }

    drawNode(node) {
        let previousStrokeStyle = this.staticContext.strokeStyle;
        this.staticContext.strokeStyle = 'black';

        switch (node.type) {
            case 'U1':
                this.drawU1(node.x, node.y)
                break;
            case 'U1U2':
                this.drawU1U2(node.x, node.y)
                break;
            case 'JOINT':
                this.drawJoint(node.x, node.y)
                break;
            case 'FREE':
                break;
        }

        this.drawWord(node.x + 1, node.y + 1, node.id);

        this.staticContext.strokeStyle = previousStrokeStyle;
    }

    drawForce(force) {
        let previousStrokeStyle = this.staticContext.strokeStyle;
        this.staticContext.strokeStyle = 'black';

        // console.log(force);

        let head = {x: force.node.x, y: force.node.y};
        let drawLength = 10;
        let tailX = head.x - drawLength * Math.cos(force.angleRad);

        let tailY = head.y - drawLength * Math.sin(force.angleRad);

        let tail = {x: tailX, y: tailY};
        switch (force.type) {
            case 'DEFINED':
                this.drawArrow(tail.x, tail.y, head.x, head.y);
                this.drawWord(tail.x, tail.y - 2, '(' + force.magnitude + ') ' + force.id);
                break;
            case 'UNKNOWN':
                this.drawArrow(tail.x, tail.y, head.x, head.y);
                this.drawWord(tail.x, tail.y - 2, '? ' + force.id);
                break;
        }

        this.drawWord(force.x + 1, force.y + 1, force.id);

        this.staticContext.strokeStyle = previousStrokeStyle;
    }

    drawCircle(x, y, r) {
        this.staticContext.beginPath();
        this.staticContext.arc(this.xPtToPx(x), this.yPtToPx(y), this.ptToPx(r), 0, 2 * Math.PI);
        this.staticContext.stroke();
    }

    drawJoint(x, y) {
        this.drawCircle(x, y, 1);
    }

    drawU1(x, y) {
        let dX = 2;
        let dY = 2;
        this.drawJoint(x, y)
        this.drawLine(x, y, x - dX, y + dY);
        this.drawLine(x - dX, y + dY, x - dX, y - dY);
        this.drawLine(x - dX, y - dY, x, y);
        this.drawCircle(x - 2.5, y + 2, .5);
        this.drawCircle(x - 2.5, y + 2, .5);
    }

    drawU2(x, y) {
        this.drawU1U2(x, y);
        this.drawCircle(x - 2, y - 2.5, .5);
        this.drawCircle(x + 2, y - 2.5, .5);
    }

    drawU1U2(x, y) {
        let dX = 2;
        let dY = 2;
        this.drawJoint(x, y)
        this.drawLine(x, y, x - dX, y - dY);
        this.drawLine(x - dX, y - dY, x + dX, y - dY);
        this.drawLine(x + dX, y - dY, x, y);
    }

    drawWord(x, y, text, context = this.staticContext) {
        context.fillText(text, this.xPtToPx(x), this.yPtToPx(y));
    }

    drawWordReal(x, y, text) {
        this.staticContext.fillText(text, x, y);
    }

    // moving and zooming

    zoomIn(scale= 1.25){
        this.w = Math.round(this.w*(1/scale));
        this.Cx = Math.round(this.Cx*(1/scale));

        this.h = Math.round(this.h*(1/scale));
        this.Cy = Math.round(this.Cy*(1/scale));

        this.ptInPx = this.staticCanvas.width / this.w;

        this.drawSystem();
    }
    zoomOut(scale= 1.25){
        this.w = Math.round(this.w*(scale));
        this.Cx = Math.round(this.Cx*(scale));

        this.h = Math.round(this.h*(scale));
        this.Cy = Math.round(this.Cy*(scale));

        this.ptInPx = this.staticCanvas.width / this.w;

        this.drawSystem();
    }
    moveInX(x= 10){
        this.Cx -= x;
        this.drawSystem();
    }
    moveInY(y= 10){
        this.Cy -= y;
        this.drawSystem();
    }
    centerView() {
        this.Cx = Math.round(this.w/2);
        this.Cy = Math.round(this.h/2);
        this.drawSystem();
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

    setupEvents() {
        this.dynamicCanvas.addEventListener('mousemove', e => {
            this.dynamicCanvas.tabIndex=0;
            this.dynamicCanvas.focus();
            this.drawCoordinatePosition('pointer', e.offsetX, e.offsetY);
        });

        this.dynamicCanvas.addEventListener('mousedown', e => {
           //
        });

        this.dynamicCanvas.addEventListener('keydown', (e) => {
            let displacement = Math.round(this.w/10);
            switch(e.keyCode){
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
                case 73://i: in
                    this.zoomIn();
                    break;
                case 79://o: out
                    this.zoomOut();
                    break;
                case 67://c: center
                    this.centerView();
                    break;

            }
        });
    }
}