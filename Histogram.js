class Histogram {
  constructor(words) {
    this.data = [[], [], [], [], []];
    this.computeFrequencies(words);
    this.sort();
    this.index();
    this.strings = this.makeStrings();
  }
  computeFrequencies(words) {
    for (let word of words) {
      for (let pos in range(0, 5)) {
        this.incr(pos, word[pos]);
      }
    }
  }
  incr(pos, key) {
    let c = key.charCodeAt(0) - "A".charCodeAt(0);
    let elem = this.data[pos][c] || { key: key, count: 0 };
    elem.count++;
    this.data[pos][c] = elem;
  }
  sort() {
    for (let histo of this.data) {
      histo.sort((a, b) => b.count - a.count);
    }
  }
  index() {
    for (let histo of this.data) {
      histo.map((elem, index) => (elem.index = index));
    }
  }
  makeStrings() {
    let strings = [];
    for (let pos in range(0, 5)) {
      strings[pos] = this.data[pos].map((entry) => entry.key).join("");
    }
    return strings;
  }
  getPriority(pos, char) {
    return this.strings[pos].indexOf(char);
  }
}
exports.Histogram = Histogram;

function range(min, max) {
  let r = [];
  for (let i = min; i < max; i++) {
    r.push(i);
  }
  return r;
}
