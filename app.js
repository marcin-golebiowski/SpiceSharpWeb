var width = 800;
var height = 500;
var resolution = 20;
var NS = "http://www.w3.org/2000/svg";
var writeDrawing = false;
var id = 0;
var currentWire = null;
var wires = [];
var currentPoint = null;
var line = d3.line();
var gen = line.curve(d3.curveStepBefore);
var svg, svgrect, group, wiresGroup, lineDrag, pathPointsDrag;
var selectionData = null;
var selectedData = null;
var dragging = true;
var x1Start = 0;
var y1Start = 0;


function removeWirePoint(point, val) {
  var g = d3.select(point.parentNode);
  var d = g.datum();
  var points = d.points;
  for (var i = points.length - 1; i >= 0; i--) {
    if (points[i][0] === val[0] && points[i][1] === val[1]) {
      points.splice(i, 1);
      break;
    }
  }

  if (points.length == 0) {
    for (var i = wires.length - 1; i >= 0; i--) {
      if (wires[i] == d) {
        wires.splice(i, 1);
      }
    }
  }

  update();
}

function finishWire(pop) {
  if (pop) {
    currentWire.points.pop();
  }
  writeDrawing = false;
  currentPoint = null;

  currentWire = null;
  wires.forEach(function (wire) { wire.points.forEach(function (p) { p[2] = false }) });
  update();
  d3.event.stopPropagation();
  return;
}

function removeWire(data) {
  for (var i = wires.length - 1; i >= 0; i--) {
    if (wires[i] == data) {
      wires.splice(i, 1);
      update();
      break;
    }
  }

  writeDrawing = false;
}

function newWire() {
  writeDrawing = true;
  currentWire = { id: ++id, points: [] };
  wires.push(currentWire);
}

var gridMenu = [
  {
    title: "Draw wire",
    action: function (data) {
      newWire();
    },
    disabled: function () {
      return writeDrawing;
    }
  },

  {
    title: "Finish wire",
    action: function (data) {
      finishWire(true);
    },
    disabled: function () {
      return !writeDrawing;
    }
  }
];
var wireMenu = [
  {
    title: "Remove wire",
    action: function (data) {
      removeWire(data);
    },
    disabled: function () {
      return writeDrawing;
    }
  }];
var pathPointMenu = [
  {
    title: "Remove wire point",
    action: function (val) {
      removeWirePoint(this, val);
    },
    disabled: function () {
      return writeDrawing;
    }
  },
  {
    title: "Finish wire",
    action: function (data) {
      finishWire();
    },
    disabled: function () {
      return !writeDrawing;
    }
  }
];

function round(p, n) {
  return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}

function redrawWires() {

  var wiresSelection =
    wiresGroup
      .selectAll("g.wire")
      .data(wires, function (d) { return d.id; })

  wiresSelection
    .enter()
    .append("g")
    .attr("class", "wire")
    .attr("x", function (d) { return d.id; })
    .append("path")
    .attr("class", "wire")
    .on("mouseover", function () {
      d3.select(this).attr("class", "active-wire");
    })
    .on("mouseout", function () {
      d3.select(this).attr("class", "wire");
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

  wiresGroup
    .selectAll("g.wire")
    .each(function (data, i) {

      // update path
      d3.select(this)
        .select("path")
        .attr("d", function (d) {
          return gen(d.points);
        })

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
            if (lastPoint[0] == d[0] && lastPoint[1] == d[1]) {
              currentWire = clickedWire;
              currentPoint = [d[0], d[1], true];
              currentWire.points.push(currentPoint);
            }
            else {
              newWire();
              currentPoint = [d[0], d[1], true];
              currentWire.points.push([d[0], d[1], false]);
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
        .attr('cx', function (d) { return d[0] })
        .attr('cy', function (d) { return d[1] })
        .attr('class', function (d, i) {
          if (d[2]) {
            return 'active';
          }
          return 'no-last';
        })
    })
}

function removeDuplicates(wire) {
  var dict = {};
  var points = wire.points;
  for (var i = points.length - 1; i >= 0; i--) {
    var key = points[i][0] + "-" + points[i][1];
    if (dict[key] == null) {
      dict[key] = true;
    }
    else {
      points.splice(i, 1);
      dict[key] = false;
    }
  }
}

function pathPointsDragged(d) {
  var x = d3.event.x,
    y = d3.event.y;
    d[0] = round(x, resolution);
    d[1] = round(y, resolution);
    update();
}

function lineDragged(d) {

  d3.select(this).attr("class", "active-wire");

  var x = d3.event.x;
  var y = d3.event.y;
  var xRes = round(x, resolution);
  var yRes = round(y, resolution);

  for (var i = 0; i < d.points.length; i++) {
    d.points[i][0] += xRes - xResStart;
    d.points[i][1] += yRes - yResStart;
  }

  xResStart = xRes;
  yResStart = yRes;
  update();
}


function deactivePoints() {
  wires.forEach(function (wire) { wire.points.forEach(function (p) { p[2] = false }) });
}

function lineDraggedStart(d) {
  var x = d3.event.x;
  var y = d3.event.y;
  xResStart = round(x, resolution);
  yResStart = round(y, resolution);
  writeDrawing = false;
  deactivePoints();
}


function lineDraggedEnd(d) {
  d3.select(this).attr("class", "wire");
  update();
}

function gridClick() {
  if (writeDrawing) {
    var x1 = round(d3.event.x, resolution);
    var y1 = round(d3.event.y, resolution);

    deactivePoints();

    if (currentPoint[0] != x1) {
      currentWire.points.push([
        x1,
        currentPoint[1],
        false
      ]);
    }
    currentWire.points.push([
      x1,
      y1,
      true
    ]);

    currentPoint = currentWire.points[currentWire.points.length - 1];
    update();
  }
}

function drawGrid() {
  var grid = svg
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


  svg
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

function init() {
  svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  pathPointsDrag = d3.drag().on("drag", pathPointsDragged);
  lineDrag = d3.drag()
    .on("drag", lineDragged)
    .on("start", lineDraggedStart)
    .on("end", lineDraggedEnd);

  drawGrid();

  svg
    .on("mousemove", function (d) {
      if (writeDrawing) {
        var x1 = round(d3.event.x, resolution);
        var y1 = round(d3.event.y, resolution);

        if (currentPoint == null) {
          deactivePoints();
          currentPoint = [x1, y1, true];
          currentWire.points.push(currentPoint);
        }
        else {
          currentPoint[0] = x1;
          currentPoint[1] = y1;
        }
        update();
        return;
      }

      if (dragging && selectedData != null && selectedData[2] != 0 && selectedData[3] != 0) {
        var x1 = d3.event.x;
        var y1 = d3.event.y;

        var xDiff = x1 - x1Start;
        var yDiff = y1 - x2Start;

        wires.forEach(function (wire) {
          wire.points.forEach(function (p) {
            if (p[7]) {
              p[0] = round(p[3] + xDiff, resolution);
              p[1] = round(p[4] + yDiff, resolution);
            }
          })
        });

        selectedData[0] = xDiff + selectedData[4];
        selectedData[1] = yDiff + selectedData[5];
        update();
        return;
      }

      if (selectionData != null) {
        var x1 = d3.event.x;
        var y1 = d3.event.y;
        var width = x1 - selectionData[0];
        var height = y1 - selectionData[1];

        if (width > 0 && height > 0) {
          selectionData[2] = width;
          selectionData[3] = height;
        }

        update();
      }
    });

  svg.on("dblclick", () => finishWire(false))

  svg.on("click", gridClick)

  svg.on("mousedown", function () {
    if (writeDrawing) {
      return;
    }

    if (selectionData != null) {
      return;
    }

    if (selectedData != null) {
      dragging = true;
      x1Start = d3.event.x;
      x2Start = d3.event.y;

      wires.forEach(function (wire) {
        wire.points.forEach(function (p) {

          if ((p[0] > selectedData[0] && p[0] < selectedData[0] + selectedData[2])
            && (p[1] > selectedData[1] && p[1] < selectedData[1] + selectedData[3])) {
            p[7] = true;
            p[3] = p[0];
            p[4] = p[1];
          }
        })
      });
    }

    var x1 = d3.event.x;
    var y1 = d3.event.y;
    selectionData = [x1, y1, 0, 0];

    svg
      .selectAll("rect.selected")
      .remove();

    svg
      .selectAll("rect.selection")
      .data([selectionData])
      .enter()
      .append("rect")
      .attr("class", "selection")
  });

  svg.on("mouseup", function () {

    dragging = false;
    svg
      .selectAll("rect.selected")
      .remove();

    if (selectionData != null) {
      selectedData = [selectionData[0], selectionData[1], selectionData[2], selectionData[3], selectionData[0], selectionData[1]];

      wires.forEach(function (wire) {
        wire.points.forEach(function (p) {
          p[7] = false;
        })
      });

      svg
        .append("rect")
        .attr("class", "selected")
        .datum(selectedData)
        .attr("x", function (d) { return d[0] })
        .attr("y", function (d) { return d[1]; })
        .attr("width", function (d) { return d[2]; })
        .attr("height", function (d) { return d[3]; });

      selectionData = null;
    }
    svg
      .selectAll("rect.selection")
      .remove();
  });

  wiresGroup = svg
    .append("g")
    .attr("class", "wires")
}

function redrawComponents() {
  var components = svg.selectAll("use").data(componentsData, function (d) {
    return d.id;
  });

  var newComponents = components
    .enter()
    .append("use")
    .attr("xlink:href", function (d) {
      return d.name;
    })
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    })
    .call(componentDrag);

  components
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    });
}

function updateSelection() {
  svg
    .selectAll("rect.selection")
    .attr("x", function (d) { return d[0] })
    .attr("y", function (d) { return d[1]; })
    .attr("width", function (d) { return d[2]; })
    .attr("height", function (d) { return d[3]; })

  svg
    .selectAll("rect.selected")
    .attr("x", function (d) { return d[0] })
    .attr("y", function (d) { return d[1]; })
    .attr("width", function (d) { return d[2]; })
    .attr("height", function (d) { return d[3]; })
}

function update() {
  updateSelection();
  redrawWires();
  //redrawWirePoints();
}

init();
update();