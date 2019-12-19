function Point(x, y, selected, onChange = null) {
    var self = this;
    self._x = x;
    self._y = y;
    self._selected = selected;
  
    function equals(otherPoint) {
      return self._x === otherPoint.x && self._y === otherPoint.y;
    }
  
    return {
      set x(val) {
        self._xPrev = self._x;
        self._x = val;
        if (onChange !== null && self._yPrev !== self._y) {
          onchange(self, 'x');
        }
      },
      get x() {
        return self._x;
      },
      set y(val) {
        self._yPrev = self._y;
        self._y = val;
        if (onChange !== null && self._yPrev !== self._y) {
          onchange(self, 'y');
        }
      },
      get y() {
        return self._y;
      },
      set selected(val) {
        self._selectedPrev = self._selected;
        self._selected = val;
        if (onChange !== null && self._selectedPrev !== self._selected) {
          onchange(self, 'selected');
        }
      },
      get selected() {
        return self._selected;
      },
      equals
    }
  }