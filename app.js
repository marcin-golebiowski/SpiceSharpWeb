var width = 960,
    height = 500,
    resolution = 20;

var linePoints = d3.range(1, 5).map(function(i) {
  return [round(i * width / 5, resolution), round( 50 + Math.random() * (height - 100), resolution)];
});
var line = d3
    .line();
var gen = line.curve(d3.curveStepAfter);


function round(p, n) {
  return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}

var points = d3.range(2).map(function() {
    return {
      x: round(Math.random() * width, resolution),
      y: round(Math.random() * height, resolution),
      color:  Math.random() * 10 < 5 ? 'yellow': 'red'
    };
  });

  function redraw() {
    var pathD = gen(linePoints);
    svg.select("path").attr("d", pathD);
  }

 // Define your menu
 var menu = [
    {
      title: 'Remote item',
      action: function (data) {
        for(var i = points.length - 1; i >= 0; i--) {
          if(points[i].x === data.x && points[i].y === data.y) {
            points.splice(i, 1);
          }
        } 

        update();

      }
    },
  ];

function dragged(d) {
  var 
    x = d3.event.x, 
    y = d3.event.y,
    gridX = round(Math.max(0, Math.min(width - 100, x)), resolution),
    gridY = round(Math.max(0, Math.min(height - 100, y)), resolution);

  d3.select(this)
    .attr("x", (d.x = gridX))
    .attr("y", (d.y = gridY));
}

function pathPointsDragged(d) {
  var 
    x = d3.event.x, 
    y = d3.event.y;
    d[0] = round(x, resolution);
    d[1] = round(y, resolution);

    update();
}

var drag = d3.drag()
.on("drag", dragged);

var pathPointsDrag = d3.drag()
.on("drag", pathPointsDragged);

    var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    svg
    .selectAll(".vertical")
    .data(d3.range(1, width / resolution))
    .enter()
    .append("line")
    .attr("class", "vertical")
    .attr("x1", function(d) {
      return d * resolution;
    })
    .attr("y1", 0)
    .attr("x2", function(d) {
      return d * resolution;
    })
    .attr("y2", height);

  svg
    .selectAll(".horizontal")
    .data(d3.range(1, height / resolution))
    .enter()
    .append("line")
    .attr("class", "horizontal")
    .attr("x1", 0)
    .attr("y1", function(d) {
      return d * resolution;
    })
    .attr("x2", width)
    .attr("y2", function(d) {
      return d * resolution;
    });

    function handleMouseOver(d, i) {  // Add interactivity
     

    }
    
    var path =  svg
    .append("path")
      .datum(linePoints)
      .attr("class", "line");

function update() {

  path
    .call(redraw);

var pathPoints = svg
  .selectAll('circle')
  .data(linePoints);

var pathPointsEnter = 
  pathPoints
  .enter()
  .append('circle')
  .attr('r', 3)
  .attr('cx', function(d) { return d[0] })
  .attr('cy', function(d) { return d[1] })
  .call(pathPointsDrag);

var pathPointsUpdate = 
  pathPoints
  .attr('cx', function(d) { return d[0] })
  .attr('cy', function(d) { return d[1] })
  .call(pathPointsDrag)
  .on('mouseover', handleMouseOver);


var rects = svg
 .selectAll("rect")
 .data(points, function(d) { 
  return d.x + "-" + d.y;
 });

  var newRects = 
   rects  
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    })
    .attr("width", round(100, resolution))
    .attr("height", round(100, resolution))
    .attr("fill",  function(d) {
      return d.color;
    })
    .call(drag)
    .on('contextmenu', d3.contextMenu(menu, {
        theme: function () {
            return 'd3-context-menu-theme';
        },
        onOpen: function (data, index) {
          console.log('Menu Opened!', 'element:', this, 'data:', data, 'index:', index);
        },
        onClose: function (data, index) {
          console.log('Menu Closed!', 'element:', this, 'data:', data, 'index:', index);
        },
        position: function (data, index) {
            return {
              left: d3.event.x,
              top: d3.event.y
          }
        }
      })); // attach menu to element
    
  var removedRects = 
      rects
      .exit()
      .remove();
}

update();
