function NetMatrixElement() {
    var self = this;
    self.wires = [];
    self.nodeId = null;
    
    function addWire(wire) {
        for (var i = 0; i < self.wires.length; i++) {
            if (self.wires[i] === wire) {
                return;
            }
        }
        self.wires.push(wire);
    }

    function isEmpty() {
        return self.wires.length === 0;
    }

    return {
        nodeId: self.nodeId,
        isEmpty,
        addWire,
        wires: self.wires
    }
};