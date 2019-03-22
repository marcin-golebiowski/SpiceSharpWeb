function SchematicView(width, height, resolution) {
    var self = this;
  
    // public
    self.presenter = null;
    self.width = width;
    self.height = height;
    self.resolution = resolution;
  
    // private
    function updateWire(wireNode) {
      d3
      .select(wireNode)
      .select('path')
      .attr('d', function (d) {
        return pathGenerator.generate(d.points);
      })
      updateWireCircles(wireNode);
    }

    function updateWireCircles(wireNode) {
      d3
      .select(wireNode)
      .selectAll('circle')
      .attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
      .attr('class', function (d, i) {
        if (d.selected) {
          return 'selected';
        }
        return 'not-selected';
      })
    }
  
    self.updateWires = function() {

      var wiresObj = self.presenter.getWires();
      var wires = wiresObj.wires;

      var lineDrag = d3.drag();

      var lineDragStart = d3.local();

      lineDrag
      .on('start', function(wire) {
        lineDragStart.set(this, { x: tools.round(d3.event.x, resolution), y: tools.round(d3.event.y, resolution)});
      })
      .on('end', function(wire) {
        var x = tools.round(d3.event.x, resolution);
        var y = tools.round(d3.event.y, resolution);
        wire.move(x - lineDragStart.get(this).x, y -lineDragStart.get(this).y);
        updateWire(this.parentNode);
      })
      .on('drag', function(wire) {
        wire.move(d3.event.x -lineDragStart.get(this).x, d3.event.y -lineDragStart.get(this).y);
        lineDragStart.set(this, { x: d3.event.x, y: d3.event.y});
        updateWire(this.parentNode);
      })

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
        })
        .on("mouseout", function (d) {
        })
        .call(lineDrag);      
  
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
  
            var circleDrag = d3.drag();

            circleDrag
            .on('drag', function(point) {
              var x = tools.round(d3.event.x, resolution);
              var y = tools.round(d3.event.y, resolution);

              point.x = x;
              point.y = y;

              updateWire(this.parentNode);
            })


            var circleMenu = [
              {
                title: "Remove point",
                action: function (point) {
                  self.presenter.removePoint(point);
                  return true;
                },
                disabled: function () {
                  return self.presenter.writeDrawing;
                }
              }
            ];

          circles
            .enter()
            .append("circle")
            .attr('r', 3)
            .call(circleDrag)
            .on(
              "contextmenu",
              d3.contextMenu(circleMenu, {
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

          updateWireCircles(this);
  
          circles
            .exit()
            .remove()
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
    }
  
    function attachSvgRootEvents() {
      var gridMenu = [
        {
          title: "Draw wire",
          action: function (data) {
            self.presenter.newWire();
          },
          disabled: function () {
            return self.presenter.writeDrawing;
          }
        },
  
        {
          title: "Finish wire",
          action: function (data) {
            self.presenter.finishWire();
            return true;
          },
          disabled: function () {
            return !self.presenter.writeDrawing;
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
  
      self
        .svgRoot
        .on("mousemove", function (d) {
          if (self.presenter.writeDrawing) {
            var x = tools.round(d3.event.x, resolution);
            var y = tools.round(d3.event.y, resolution);
            self.presenter.currentPoint = new Point(x, y);
          }
        });
  
        self
        .svgRoot
        .on("click", function (d) {
          if (self.presenter.writeDrawing) {
            self.presenter.addPointToWire();
          }
        });
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
  
    self.updateCurrentPoint = function () {
      var data = [];
      var currentPoint = self.presenter.currentPoint;
  
      if (currentPoint !== null) {
        data.push(currentPoint);
      }
  
      self
        .svgRoot
        .selectAll("circle.currentPoint")
        .data(data, function (d) { return d != null ? d.x + "-" + d.y : null })
        .join("circle")
        .attr("class", "currentPoint")
        .attr("cx", function (d) { return d.x })
        .attr("cy", function (d) { return d.y })
        .attr("r", 3);
    }
  
    function init() {

      self.presenter = new SchematicPresenter(self);
      createSvgRoot();
      createGrid();
      attachSvgRootEvents();
      createWiresGroup();
  
      self.updateWires();
    }
    
    self.closeContextMenu = function() {
      d3.contextMenu('close');
    }

    self.update = function update() {
      self.updateWires();
      self.updateCurrentPoint();
      //self.closeContextMenu();
    }
  
    init();
  }