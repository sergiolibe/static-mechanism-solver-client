class Geometry {
    static pointIsOnPoint(x, y, x0, y0) {
        let leeway = 5;
        return (Math.abs(x - x0) < leeway) &&
            (Math.abs(y - y0) < leeway);
    }

    static pointIsInLineBetweenPoints(x, y, x0, y0, x1, y1) {
        return Geometry.pointBetweenPoints(x, y, x0, y0, x1, y1) &&
            Geometry.pointsAreCollinear(x, y, x0, y0, x1, y1);
    }

    static pointBetweenPoints(x, y, x0, y0, x1, y1) {
        return Geometry.valueBetweenValues(x, x0, x1) &&
            Geometry.valueBetweenValues(y, y0, y1);
    }

    static pointsAreCollinear(x, y, x0, y0, x1, y1) {
        let leeway = 50e-3;
        let orthogonalLeeway = 2;

        let yDivisor = y1 - y0;
        if (yDivisor === 0)
            return Math.abs(y - y0) <= orthogonalLeeway;

        let yRelative = (y - y0) / yDivisor;

        let xDivisor = x1 - x0;
        if (xDivisor === 0) {
            return Math.abs(x - x0) <= orthogonalLeeway;
        }

        let xRelative = (x - x0) / xDivisor;

        return Math.abs(yRelative - xRelative) <= leeway;
    }

    static valueBetweenValues(v, v0, v1) {
        if (v1 === v0) {
            let orthogonalLeeway = 2;
            return Math.abs(v - v0) <= orthogonalLeeway;
        }

        return v1 > v0 ?
            (v0 < v && v < v1) :
            (v1 < v && v < v0);
    }
}

export default Geometry;