function Wire(id) {
    var self = this;
  
    self._id = id;
    self._points = [];
    self.selected = false;
  
    function onPointChange(point, propertyName) {
    }
  
    function getId() {
      return self._id;
    }
  
    function addPoint(point) {
      self._points.push(point);
    }
  
    function getPoints() {
      return self._points;
    }
  
    function removePoint(pointToRemove) {
      for (var i = self._points.length - 1; i >= 0; i--) {
        if (_points.equals(pointToRemove)) {
          _points.splice(i, 1);
          break;
        }
      }
    }

    function move(xDiff, yDiff) {
      for (var i = self._points.length - 1; i >= 0; i--) {
          self._points[i].x += xDiff;
          self._points[i].y += yDiff;
      }
    }

    function deselect() {
      for (var i = self._points.length - 1; i >= 0; i--) {
          self._points[i].selected =false;
      }
    }
  
    return {
      id: getId,
      addPoint,
      deselect,
      set selected(value) {
        self.select = value;
      },
      get selected() {
        return self.select;
      },
      get points() {
        return getPoints()
      },
      removePoint,
      move
    }
  }