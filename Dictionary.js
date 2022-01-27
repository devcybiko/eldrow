const glstools = require("glstools");
const gfiles = glstools.files;

class Dictionary {
  constructor(wordfile, omitfile) {
    if (typeof wordfile === "string") {
      this.wordfile = wordfile;
      this.omitfile = omitfile;
      this.words = this.loadWords();
      this.omits = this.loadOmittedWords();
    } else {
      // assuming wordfile is array of words
      this.wordfile = null;
      this.omitfile = null;
      this.words = wordfile;
      this.omits = omitfile;
    }

    this.scores = {};
    if (this.omits) this.omitWords(this.omits);
  }
  getWords() {
    return this.words;
  }
  getScores() {
    return this.scores;
  }
  loadWords() {
    let words = gfiles.readList(this.wordfile).map((line) => line.trim());
    return this.normalizeWords(words);
  }
  normalizeWords(words) {
    words = words.filter((word) => word.length === 5);
    words = words.map((word) => word.toUpperCase());
    return words;
  }
  removeWord(word) {
    let n = words.indexOf(word);
    if (n > -1)
      this.words.splice(n, 1);
  }
  omitWords(omits) {
    for (let omit of omits) {
      this.removeWord(omit);
    }
  }
  loadOmittedWords(omitfile) {
    let omits = gfiles.readList(omitfile) || [];
    omits = this.normalizeWords(omits);
    return omits;
  }
  saveOmittedWords() {
    let unique = {};
    this.omits.foreach((omit) => (unique[omit] = omit));
    let sorted = Object.keys(unique).sort();
    gfiles.writeList(this.omitfile, sorted);
  }
  updateOmits(word) {
    omits.push(opts.omit);
    this.saveOmittedWords();
  }
  scoreWords(histogram) {
    this.scores = [];
    for (let word of this.words) {
      let score = 0;
      for (let pos in range(0, 5))
        score += histogram.getPriority(pos, word[pos]);
      this.scores.push({ word, score });
    }
    this.scores.sort((a, b) => a.score - b.score);
  }
}
exports.Dictionary = Dictionary;

function range(min, max) {
  let r = [];
  for (let i = min; i < max; i++) {
    r.push(i);
  }
  return r;
}
