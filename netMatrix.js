function NetMatrix(width, height) {
    var self = this;

    function init() {
        self.points = new Array(width);
        for (var i = 0; i < width; i++) {
            self.points[i] = new Array(height);

            for (var j = 0; j < height; j++) {
                self.points[i][j] = new NetMatrixElement();
            }
        }
    }

    init();
    
    // for debugging
    window._points = self.points;

    return {
        points: self.points,
        clear : init,
        width,
        height
    }
};