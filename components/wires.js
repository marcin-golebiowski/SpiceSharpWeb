function Wires() {
    var self = this;
    self.wires = [];
  
    function remove(wire) {
      for (var i = wires.length - 1; i >= 0; i--) {
        if (self.wires[i] === wire) {
          self.wires.splice(i, 1);
          break;
        }
      }
    }
  
    function add(wire) {
      self.wires.push(wire);
    }

    return {
      remove,
      add,
      get elements() {
        return self.wires;
      },
      get name() {
        return self.name
      }
    }
  }