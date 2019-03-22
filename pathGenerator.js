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

var pathGenerator = new PathGenerator();