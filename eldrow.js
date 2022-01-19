#!/usr/bin/env node

/**
 * solve wordle
 **/

const glstools = require("glstools");
const gprocs = glstools.procs;
const gstrings = glstools.strings;
const gfiles = glstools.files;
const fs = require("fs");
const path = require("path");
const { die } = require("glstools/js/glsprocs");

function help() {
  console.log("\neldrow guess1=pattern guess2=pattern...");
  console.log("  with no parameters, it will generate a first guess");
  console.log("  with parameters, it will generate a next guess");
  console.log("  enter guesses and results from Wordle as follows");
  console.log("  - pattern has a letter for each letter in the guess");
  console.log("  - G - for green");
  console.log("  - Y - for yellow");
  console.log("  - B - for black");
  console.log("  example:");
  console.log("  $ eldrow");
  console.log("  > SHARE");
  console.log("  $ eldrow share=GBBYB");
  console.log("  > SORTE");
  console.log("  $ eldrow share=GBBYB sorte=GBBYB");
  gprocs.die("");
}

function computeHistogram_save(words) {
    // compute frequency of occurance of letters
    let histogram = [];
    for (let pos = 0; pos < 5; pos++) {
      histogram[pos] = [];
    }
    for (let word of words) {
      for (let pos = 0; pos < 5; pos++) {
        word = word.toUpperCase();
        if (word.length !== 5) continue;
        let char = word[pos];
        let n = char.charCodeAt(0) - "A".charCodeAt(0);
        let elem = histogram[pos][n] || { key: char, count: 0 };
        elem.count++;
        histogram[pos][n] = elem;
      }
    }
    histogram.map((list) => list.sort((a, b) => b.count - a.count));
    histogram.map((list) =>
      list.map((elem, index) => {
        elem.index = index;
        return elem;
      })
    );
    console.log(histogram);
    return histogram;
  }

  function computeHistogram(words) {
    // compute frequency of occurance of letters
    let histogram = [];
    for (let pos = 0; pos < 5; pos++) {
      histogram[pos] = [];
    }
    for (let word of words) {
      for (let pos = 0; pos < 5; pos++) {
        word = word.toUpperCase();
        if (word.length !== 5) continue;
        let char = word[pos];
        let n = char.charCodeAt(0) - "A".charCodeAt(0);
        let elem = histogram[0][n] || { key: char, count: 0 };
        elem.count++;
        histogram[0][n] = elem;
      }
    }
    histogram[1] = histogram[0];
    histogram[2] = histogram[0];
    histogram[3] = histogram[0];
    histogram[4] = histogram[0];
    histogram.map((list) => list.sort((a, b) => b.count - a.count));
    histogram.map((list) =>
      list.map((elem, index) => {
        elem.index = index;
        return elem;
      })
    );
    console.log(histogram);
    return histogram;
  }


function computeDictionary(omits, wordfile, dictionaryfile) {
    let dictionary = gfiles.readList(dictionaryfile);
    if (dictionary) {
        for(let omit of omits) {
            let n = dictionary.indexOf(omit);
            if (n > -1) dictionary.splice(n, 1);
        }
        return dictionary;
    }

    let words = gfiles
    .readList(wordfile)
    .map((line) => line.trim());
    let histogram = computeHistogram(words);


  let lookup = {};
  for (let word of words) {
    lookup[word] = word;
  }
  dictionary = [];
  for (let i0 = 0; i0 < 26; i0++) {
    for (let i1 = 0; i1 < 26; i1++) {
      for (let i2 = 0; i2 < 26; i2++) {
        for (let i3 = 0; i3 < 26; i3++) {
          for (let i4 = 0; i4 < 26; i4++) {
            let word =
              histogram[0][i0].key +
              histogram[1][i1].key +
              histogram[2][i2].key +
              histogram[3][i3].key +
              histogram[4][i4].key;
            if (lookup[word] && !omits.includes(word)) dictionary.push(word);
          }
        }
      }
    }
  }
  gfiles.writeList(dictionaryfile, dictionary);
  return dictionary;
}

function remove(s, c) {
  let n = s.indexOf(c);
  if (n === -1) return s;
  let a = s.split("");
  a.splice(n, 1);
  a = a.join("");
  return a;
}

function computePossibles(guesses) {
  let possibles = [];
  let must = {};
  for (let pos = 0; pos < 5; pos++) {
    possibles[pos] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  for (let guess of guesses) {
    let parts = guess.toUpperCase().split("=");
    let word = parts[0];
    let answer = parts[1];
    for (let pos = 0; pos < 5; pos++) {
      if (answer[pos] === "G") {
        possibles[pos] = word[pos];
        must[word[pos]] = word[pos];
      }
      if (answer[pos] === "B") {
        for (let i = 0; i < 5; i++)
          possibles[i] = remove(possibles[i], word[pos]);
      }
      if (answer[pos] === "Y") {
        possibles[pos] = remove(possibles[pos], word[pos]);
        must[word[pos]] = word[pos];
      }
    }
  }
  possibles.must = Object.keys(must);
  console.log(possibles);
  return possibles;
}

function includesAll(word, must) {
  for (let m of must) {
    if (!word.includes(m)) return false;
  }
  return true;
}

function computeGuess(dictionary, possibles, nodups = false) {
  for (let word of dictionary) {
    let pos;
    let group = {};
    for (pos = 0; pos < 5; pos++) {
      if (!possibles[pos].includes(word[pos])) break;
      group[word[pos]] = word[pos];
    }
    if (pos === 5) {
      if (!includesAll(word, possibles.must)) continue;
      if (!nodups) return word;
      if (Object.keys(group).length === 5) return word;
    }
  }
  return null;
}

function computeGuess_save(dictionary, possibles) {
  let stack = [0, 0, 0, 0, 0];
  let guess = "";
  while (true) {
    guess = "";
    for (let pos = 0; pos < 5; pos++) guess += possibles[pos][stack[pos]];
    if (dictionary.includes(guess)) return guess;
    for (let i = 0; i < 5; i++) {
      stack[i] += 1;
      if (stack[i] < possibles[i].length) break;
      stack[i] = 0;
      if (i === 4) break;
    }
  }
  return guess;
}
async function main$(_opts) {
  let opts =
    _opts ||
    gprocs.args(
      "--help,--omitfile=omit.txt,--omit=,--wordfile=five-letter-words.txt,--dictionary=dictionary.txt",
      "word1,word2,word3,word4,word5,word6"
    );
  if (opts.help) help();
  let omits = gfiles.readList(opts.omitfile);
  if (opts.omit) {
      omits.push(opts.omit);
      gfiles.writeList(opts.omitfile, omits);
  }
  let dictionary = computeDictionary(omits, opts.wordfile, opts.dictionary);
  let guesses = opts._files;
  let possibles = computePossibles(guesses);
  let guess = computeGuess(dictionary, possibles, guesses.length === 0);
  console.log(guess);
}

module.exports = { main$ };

if (module.id === ".") {
  return main$();
}
