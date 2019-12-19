function Tools() {
    function round(p, n) {
      return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
    }
  
    return {
      round
    }
}
var tools = new Tools();