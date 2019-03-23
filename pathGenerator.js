function PathGenerator(resolution) {
  var gen = d3.line().curve(d3.curveStepBefore);

  function flat(points) {
    var result = [];

    for (var i = 0; i < points.length; i++) {
      result.push([points[i].x * resolution, points[i].y * resolution]);
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