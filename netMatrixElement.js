function NetMatrixElement() {
    var self = this;
    self.wires = [];
    
    function addWire(wire) {
        for (var i = 0; i < self.wires.length; i++) {
            if (self.wires[i] === wire) {
                return;
            }
        }
        
        self.wires.push(wire);
    }

    return {
        addWire,
        wires: self.wires
    }
};