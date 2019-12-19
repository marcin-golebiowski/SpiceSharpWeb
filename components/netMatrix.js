function NetMatrix(width, height) {
    var self = this;
    self.points = null;

    function init() {
        self.points = new Array(width);
        for (var i = 0; i < width; i++) {
            self.points[i] = new Array(height);

            for (var j = 0; j < height; j++) {
                self.points[i][j] = new NetMatrixElement();
            }
        }
    }

    function clear() {
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                self.points[i][j] = new NetMatrixElement();
            }
        }
    }

    function fill(wires) {
        for (var i = 0; i < wires.length; i++) {
            var wire = wires[i];
            for (var j = 0; j < wire.points.length; j++) {
                var point = wire.points[j];
                var gridPoint = self.points[point.x][point.y];
                gridPoint.addWire(wire);
            }
        }
    }

    function mark(wires, nodeId) {
        for (var i = 0; i < wires.length; i++) {
            var wire = wires[i];

            for (var j = 0; j < wire.points.length; j++) {

                var current = wire.points[j];
                var x = current.x;
                var y = current.y;
                if (self.points[x][y].nodeId === null) {
                    self.points[x][y].nodeId = nodeId;
                }

                if (j !== 0) {
                    var prev = wire.points[j - 1];
                    if (prev.x == current.x) {

                        if (prev.y < current.y) {
                            for (var l = prev.y; l < current.y; l++) {
                                if (self.points[x][l].nodeId === null) {
                                    self.points[x][l].nodeId = nodeId;
                                }
                            }
                        }
                        else {
                            for (var l = current.y; l < prev.y; l++) {
                                if (self.points[x][l].nodeId === null) {
                                    self.points[x][l].nodeId = nodeId;
                                }
                            }
                        }
                    }
                    if (prev.y == current.y) {
                        if (prev.x < current.x) {
                            for (var l = prev.x; l < current.x; l++) {
                                if (self.points[l][y].nodeId === null) {
                                    self.points[l][y].nodeId = nodeId;
                                }
                            }
                        }
                        else {
                            for (var l = current.x; l < prev.x; l++) {
                                if (self.points[l][y].nodeId === null) {
                                    self.points[l][y].nodeId = nodeId;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function connect() {
        var nodeId = 1;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var isEmpty = self.points[i][j].isEmpty();
                if (isEmpty === false) {
                    if (self.points[i][j].nodeId === null) {
                        self.points[i][j].nodeId = nodeId;
                        var nodeWires = self.points[i][j].wires;
                        mark(nodeWires, nodeId);
                        nodeId++;
                    }
                }
            }
        }
    }

    function getNodeId(wire) {
        var x = wire.points[0].x;
        var y = wire.points[0].y;

        return self.points[x][y].nodeId;
    }

    function getConnectedWires(x, y) {
        var point = self.points[x][y];
        var nodeId = point.nodeId;

        if (nodeId === null) return new Set();

        var result = new Set();
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var isEmpty = self.points[i][j].isEmpty();
                if (isEmpty === false) {
                    if (self.points[i][j].nodeId === nodeId) {
                        for (var l = 0; l < self.points[i][j].wires.length; l++) {
                            result.add(self.points[i][j].wires[l]);
                        }
                    }
                }
            }
        }
        return result;
    }

    init();

    // for debugging
    window._points = self.points;

    return {
        points: self.points,
        clear,
        connect,
        fill,
        getNodeId,
        getConnectedWires,
        width,
        height
    }
};