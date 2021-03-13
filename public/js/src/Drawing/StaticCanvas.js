import BaseCanvas from "./BaseCanvas.js";
import StaticSystem from "../Core/StaticSystem.js";

class StaticCanvas extends BaseCanvas {
    _staticSystem = null;
    listOfReactions = {};
    maxTension = -1;
    maxCompression = 1;

    set staticSystem(staticSystem) {
        if (staticSystem instanceof StaticSystem)
            this._staticSystem = staticSystem;
        else
            throw new Error('Expected instance of StaticSystem, get: ' + staticSystem)
    }

    drawGuidelines() {
        let previousStrokeStyle = this.context.strokeStyle;

        this.context.strokeStyle = 'black';
        this.drawLine(-1, 0, +1, 0);
        this.drawLine(0, -1, 0, +1);

        this.context.strokeStyle = 'rgba(123, 123, 123,0.5)';
        this.drawLine(-this.Cx + 1, 0, this.w - this.Cx - 1, 0);
        this.drawLine(0, -this.Cy + 1, 0, this.h - this.Cy - 1);
        this.context.strokeStyle = previousStrokeStyle;
    }

    drawSystem() {
        // this.listOfReactions = {};
        // this.maxTension = -1;
        // this.maxTension = 1;

        // console.log(staticSystem);
        this.cleanCanvas();
        this.drawGuidelines();

        Object.values(this._staticSystem.beams)
            .forEach((beam) => this.drawBeam(beam));

        Object.values(this._staticSystem.nodes)
            .forEach((node) => this.drawNode(node));

        Object.values(this._staticSystem.forces)
            .forEach((force) => this.drawForce(force));

        if (Object.keys(this.listOfReactions).length > 0)
            this.drawReactions();
    }

    resetReactions() {
        this.listOfReactions = {};
    }

    drawReactions(listOfReactions = null) {
        if (listOfReactions !== null) {
            this.listOfReactions = listOfReactions;
            this.maxTension = -1;
            this.maxCompression = 1;
            this.listOfReactions.forEach((reaction) => {
                if (reaction.type !== 'BEAM')
                    return;

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

        let previousStrokeStyle = this.context.strokeStyle;
        let previousLineWidth = this.context.lineWidth;

        this.context.lineWidth = 2;
        this.listOfReactions.forEach((reaction) => {
            if (reaction.type === 'U1' || reaction.type === 'U2') {
                let nodeName = reaction.referenceId;
                let magnitude = reaction.magnitude;
                this.context.strokeStyle = magnitude > 0 ? 'blue' : 'red';
                // this.context.strokeStyle = this.getInterpolatedReactionColor(magnitude);

                let node = this._staticSystem.getNodeById(nodeName);

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
                this.context.strokeStyle = 'green';

                let force = this._staticSystem.getForceById(forceName);

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
                this.context.strokeStyle = this.getInterpolatedReactionColor(magnitude);

                let beam = this._staticSystem.getBeamById(beamName);

                this.drawLine(beam.startNode.x, beam.startNode.y, beam.endNode.x, beam.endNode.y);
            }

        });
        this.context.strokeStyle = previousStrokeStyle;
        this.context.lineWidth = previousLineWidth;
        this.drawGradient();
    }

    drawBeam(beam) {
        let previousStrokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = 'black';
        this.drawLine(
            beam.startNode.x,
            beam.startNode.y,
            beam.endNode.x,
            beam.endNode.y
        )

        this.drawWord(-2 + (beam.startNode.x + beam.endNode.x) / 2, -2 + (beam.startNode.y + beam.endNode.y) / 2, beam.id);

        this.context.strokeStyle = previousStrokeStyle;
    }

    drawNode(node) {
        let previousStrokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = 'black';

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

        this.context.strokeStyle = previousStrokeStyle;
    }

    drawForce(force) {
        let previousStrokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = 'black';

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

        this.context.strokeStyle = previousStrokeStyle;
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

    drawGradient() {
        let previousFillStyle = this.context.fillStyle;
        // let gradient = this.context.createLinearGradient(0, 0, this.canvas.width/2, 0);

        let gradientX0 = this.canvasInstance.width / 4;
        let gradientW = this.canvasInstance.width / 2;
        let gradientY0 = this.canvasInstance.height - 30;
        let gradientH = 20;

        let gradient = this.context.createLinearGradient(gradientX0, 0, gradientX0 + gradientW, 0);
        gradient.addColorStop(0, this.interpolateColor(0));
        gradient.addColorStop(0.49, this.interpolateColor(0.49));
        gradient.addColorStop(0.5, this.interpolateColor(0.5));
        gradient.addColorStop(0.51, this.interpolateColor(0.51));
        gradient.addColorStop(1, this.interpolateColor(1));

        this.context.fillStyle = gradient;
        this.context.fillRect(gradientX0, gradientY0, gradientW, gradientH);
        this.context.fillStyle = previousFillStyle;

        this.drawWordReal(gradientX0, gradientY0 - 10, this.maxCompression);
        this.drawWordReal(gradientX0 + gradientW / 2, gradientY0 - 10, 0);
        this.drawWordReal(gradientX0 + gradientW, gradientY0 - 10, this.maxTension);

    }

    getInterpolatedReactionColor(magnitude) {
        let value = (magnitude - this.maxCompression) / (this.maxTension - this.maxCompression);
        return this.interpolateColor(value);
    }

    interpolateColor(value) {
        let colors = {
            red: {value: 0, arrayColor: [255, 0, 0]},
            yellow: {value: 0.49, arrayColor: [255, 255, 0]},
            black: {value: 0.5, arrayColor: [0, 0, 0]},
            cyan: {value: 0.51, arrayColor: [0, 255, 255]},
            blue: {value: 1, arrayColor: [0, 0, 255]}
        };

        let colorNames = Object.keys(colors)

        let colorLeft = colors.red;
        let colorRight = colors.red;

        for (let color of colorNames) {
            //console.log('interpolateColor: ',{value:value,color:color});
            let colorInfo = colors[color];
            colorRight = colorInfo;
            if (value === colorInfo.value) {
                //console.log('value = colorValue', {value:value,colorValue:colorInfo.value});
                return this.arrayColorToRgb(colorInfo.arrayColor);
            } else if (value > colorInfo.value) {
                //console.log('value > colorValue', {value:value,colorValue:colorInfo.value});
                colorLeft = colorInfo;
                // return this.arrayColorToRgb(colorInfo.arrayColor);
            } else {
                //console.log('value < colorValue', {value:value,colorValue:colorInfo.value});
                break;
            }
        }


        let relativeWeight = (value - colorLeft.value) / (colorRight.value - colorLeft.value);
        return this.mapColor(colorLeft.arrayColor, colorRight.arrayColor, relativeWeight);
    }

    arrayColorToRgb(color) {
        // console.log('arrayColorToRgb',color);
        return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    }

    mapColor(color1, color2, weight) {
        //console.log('mapping color',{color1:color1,color2:color2,});

        let w1 = 1 - weight;
        let w2 = weight;

        return this.arrayColorToRgb([
            Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)
        ]);
    }
}

export default StaticCanvas;