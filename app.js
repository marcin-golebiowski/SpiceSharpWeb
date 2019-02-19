




// INDENPENDENT
var pathGenerator = new PathGenerator();
var tools = new Tools();


function PathGenerator() {
  var gen = d3.line().curve(d3.curveStepBefore);

  function flat(points) {
    var result = [];

    for (var i = 0; i < points.length; i++) {
      result.push([points[i].x, points[i].y]);
    }

    return result;
  }

  function generate(points) {
    var raw = flat(points);
    return gen(raw);
  }

  return {
    generate
  }
}

function Tools() {

  function round(p, n) {
    return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
  }

  return {
    round
  }
}

// END: INDENPENDENT

// MODEL 
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


function Wire(id) {
  var self = this;

  self._id = id;
  self._points = [];
  self._selected = false;

  function onPointChange(point, propertyName) {

  }

  function getId() {
    return self._id;
  }

  function setSelected(value) {
    self._selected = value;
  }

  function getSelected() {
    return self._selected;
  }

  function addPoint(point) {
    self._points.push(point);
  }

  function getPoints() {
    return self._points;
  }

  function removePoint(pointToRemove) {
    for (var i = _points.length - 1; i >= 0; i--) {
      if (_points.equals(pointToRemove)) {
        _points.splice(i, 1);
        break;
      }
    }
  }

  return {
    id: getId,
    set selected(value) {
      setSelected(value);
    },
    get selected() {
      return getSelected();
    },
    addPoint,
    get points() {
      return getPoints()
    },
    removePoint
  }
}

function Net(name) {
  var self = this;
  self.wires = [];
  self.name = name;
  self.nextWireId = 0;

  function removeWire(wire) {
    for (var i = wires.length - 1; i >= 0; i--) {
      if (self.wires[i] === wire) {
        self.wires.splice(i, 1);
        break;
      }
    }
  }

  function addWire() {
    self.wires.push(new Wire(nextWireId++));
  }

  return {
    removeWire,
    addWire,
    get wires() {
      return self.wires;
    },
    get name() {
      return self.name
    }
  }
}


function SchematicPresenter(view) {
  var self = this;
  self.nets = [new Net('net01')];
  self.writeDrawing = false;
  self.currentWire = null;

  function getNet(netName) {
    for (var i = self.nets.length - 1; i >= 0; i--) {
      if (self.nets[i].name == netName) {
        return self.nets[i];
      }
    }

    return null;
  }

  function getNetNames() {
    var names = [];
    for (var i = self.nets.length - 1; i >= 0; i--) {
      names.push(self.nets[i].name);
    }
    return names;
  }

  function update() {
    view.update()
  }

  function newWire() {

  }

  return {
    getNetNames,
    getNet,
    newWire,
    get writeDrawing() {
      return self.writeDrawing;
    },
    set writeDrawing(value) {
      self.writeDrawing = value;
    }
  }
}

function SchematicView(width, height, resolution) {
  var self = this;
  self.presenter = null;
  self.svgRoot = null;
  self.width = width;
  self.height = height;
  self.resolution = resolution;


  var NS = "http://www.w3.org/2000/svg";

  function update() {
    redrawNets();
  }

  function redrawNets() {
    var netNames = self.presenter.getNetNames();
    netNames.forEach(name => redrawNet(name));
  }
   

  function redrawNet(name) {
    var net = self.presenter.getNet(name);
    var wires = net.wires;
    redrawWires(wires);
  }

  function redrawWires(wires) {

    var wiresSelection =
    self.wiresGroup
        .selectAll("g.wire")
        .data(wires, function (d) { return d.id; })

    wiresSelection
      .enter()
      .append("g")
      .attr("class", "wire")
      .append("path")
      .attr("class", "wire")
      .on("mouseover", function (d) {
        d.selected = true;
        redrawWires();
      })
      .on("mouseout", function (d) {
        d.selected = false;
        redrawWires();
      })
      .call(lineDrag)
      .on(
        "contextmenu",
        d3.contextMenu(wireMenu, {
          theme: function () {
            return "d3-context-menu-theme";
          },
          position: function (data, index) {
            return {
              left: d3.event.x,
              top: d3.event.y
            };
          }
        })
      )

    wiresSelection
      .exit()
      .remove();

    self.wiresGroup
      .selectAll("g.wire")
      .each(function (data, i) {

        // update path
        d3.select(this)
          .select("path")
          .attr("d", function (d) {
            return pathGenerator.generate(d.points);
          })
          .attr("class", function (d) {
            if (d.selected) {
              return "active-wire";
            }
            return "wire";
          });

        // update points
        var points = data.points;
        var circles = d3.select(this)
          .selectAll("circle")
          .data(points);

        circles
          .enter()
          .append("circle")
          .attr('r', 3)
          .on("contextmenu",
            d3.contextMenu(pathPointMenu, {
              theme: function () {
                return "d3-context-menu-theme";
              }
            })
          )
          .on("click", function (d) {
            if (!writeDrawing) {

              var clickedWire = d3.select(this.parentNode).datum();
              var lastPoint = clickedWire.points[clickedWire.points.length - 1];
              // check if last point is clicked
              if (lastPoint.equals(d)) {
                currentWire = clickedWire;
                currentPoint = new Point(d.x, d.y, true);
                currentWire.points.push(currentPoint);
              }
              else {
                newWire();
                currentPoint = new Point(d.x, d.y, true);
                currentWire.points.push(new Point(d.x, d.y, false));
                currentWire.points.push(currentPoint);
              }
              writeDrawing = true;
            }
            d3.event.stopPropagation();
            update();
          })
          .call(pathPointsDrag)

        circles
          .exit()
          .remove()

        d3.select(this)
          .selectAll("circle")
          .attr('cx', function (d) { return d.x })
          .attr('cy', function (d) { return d.y })
          .attr('class', function (d, i) {
            if (d.selected) {
              return 'active';
            }
            return 'no-last';
          })
      })
  }

  function createGrid() {
    var grid = self.svgRoot
      .append("g")
      .attr("class", "grid");

    grid
      .selectAll(".vertical")
      .data(d3.range(1, width / resolution))
      .enter()
      .append("line")
      .attr("class", "vertical")
      .attr("x1", function (d) {
        return d * resolution;
      })
      .attr("y1", 0)
      .attr("x2", function (d) {
        return d * resolution;
      })
      .attr("y2", height);

    grid
      .selectAll(".horizontal")
      .data(d3.range(1, height / resolution))
      .enter()
      .append("line")
      .attr("class", "horizontal")
      .attr("x1", 0)
      .attr("y1", function (d) {
        return d * resolution;
      })
      .attr("x2", width)
      .attr("y2", function (d) {
        return d * resolution;
      });


    var gridMenu = [
      {
        title: "Draw wire",
        action: function (data) {
          self.presenter.newWire();
        },
        disabled: function () {
          return self.writeDrawing;
        }
      },

      {
        title: "Finish wire",
        action: function (data) {
          finishWire(true);
        },
        disabled: function () {
          return !self.writeDrawing;
        }
      }
    ];

    self.svgRoot
      .on(
        "contextmenu",
        d3.contextMenu(gridMenu, {
          theme: function () {
            return "d3-context-menu-theme";
          },
          position: function (data, index) {
            return {
              left: d3.event.x,
              top: d3.event.y
            };
          }
        })
      );
  }

  function createSvgRoot() {
    self.svgRoot = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  }

  function createWiresGroup() {
    self.wiresGroup = self.svgRoot
      .append("g")
      .attr("class", "wires")
  }

  function init() {
    self.presenter = new SchematicPresenter(self);
    createSvgRoot();
    
    createGrid();
    createWiresGroup();

    redrawNets();
  }

  init();

  return {
    update
  }
}

var view = new SchematicView(800, 600, 10);