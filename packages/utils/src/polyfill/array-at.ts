if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function at(n) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;
      if (n < 0 || n >= this.length) return undefined;
      return this[n];
    },
  });
}
