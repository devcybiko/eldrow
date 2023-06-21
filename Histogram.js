class Histogram {
  // gitComment(calculate the frequency of letters in each word)
  // a histogram of letters for 5-letter words
  // each element of letterHistos is the count of the number of times that letter appears in the word list
  constructor(words) {
    this.letterHistos = [[], [], [], [], []];
    this.computeFrequencies(words);
    this.sort();
    this.index();
    this.strings = this.makeStrings();
  }
  computeFrequencies(words) {
    // for each word, increment a count for each letter in the word
    for (let word of words) {
      for (let pos in range(0, 5)) {
        this.incr(pos, word[pos]);
      }
    }
  }
  incr(pos, char) {
    // for the position of the character, increment that char's count
    let charCode = char.charCodeAt(0) - "A".charCodeAt(0);
    let elem = this.letterHistos[pos][charCode];
    if (!elem) {
      elem = { key: char, count: 0 };
      this.letterHistos[pos][charCode] = elem;
    }
    elem.count++;
  }
  sort() {
    // sort the letters by the count - higher counts rise to the top
    for (let letterHisto of this.letterHistos) {
      letterHisto.sort((a, b) => b.count - a.count);
    }
  }
  index() {
    // for the sorted histos, assing an index (priority) to each entry (letter)
    for (let letterHisto of this.letterHistos) {
      letterHisto.map((elem, index) => (elem.index = index));
    }
  }
  makeStrings() {
    //concatenate all the letters together in priority order
    let strings = [];
    for (let pos in range(0, 5)) {
      strings[pos] = this.letterHistos[pos].map((entry) => entry.key).join("");
    }
    return strings;
  }
  getPriority(pos, char) {
    // return the popularity of this char
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
