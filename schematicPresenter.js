function SchematicPresenter(view) {
    var self = this;
    self.wires = new Wires();
    self.writeDrawing = false;

    self.currentWire = null;
    self.currentPoint = null;
  
    function getWires() {
      return self.wires;
    }
    
    function update() {
      view.update()
    }
  
    function newWire() {
      self.writeDrawing = true;
      var newWire = new Wire();
      self.wires.add(newWire);
      currentWire = newWire;
    }
  
    function finishWire() {
      self.writeDrawing = false;
      self.currentPoint = null;
  
      update();
    }
  
    function addPointToWire() {
      currentWire.deselect();
      currentWire.addPoint(new Point(self.currentPoint.x, self.currentPoint.y, true));  
      view.updateWires(); // TODO: update only one wire
    }

    function removePoint(point) {
      var wires = self.wires.wires;

      for (var i = 0; i < wires.length; i++) {
        var points = wires[i].points;
        for (var j = 0; j < points.length; j++) { 
           if (points[j] === point) {
             points.splice(j, 1)
             break;
           }
        }
      }

      view.updateWires();
    }
  
    return {
      removePoint,
      addPointToWire,
      getWires,
      newWire,
      finishWire,
      get writeDrawing() {
        return self.writeDrawing;
      },
      set writeDrawing(value) {
        self.writeDrawing = value;
      },
      get currentPoint() {
        return self.currentPoint;
      },
      set currentPoint(value) {
        var redraw = false;
        if (self.currentPoint == null || !self.currentPoint.equals(value)) {
          redraw = true;
        }
        if (self.currentPoint == null)
        {
          self.currentPoint = value;
        }
        else
        {
          self.currentPoint.x = value.x;
          self.currentPoint.y = value.y;
        }
  
        if (redraw) {
          view.updateCurrentPoint();
        }
      }
    }
  }