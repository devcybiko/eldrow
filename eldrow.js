#!/usr/bin/env node

/**
 * solve wordle
 **/

const glstools = require("glstools");
const gprocs = glstools.procs;
const gmaths = glstools.maths;
const { die } = require("glstools/js/glsprocs");
const { Dictionary } = require("./Dictionary");
const { Histogram } = require("./Histogram");

async function main$(_opts) {
  let opts = getOpts(_opts);
  let pastGuesses = opts._files;
  console.log(opts);
  let dictionary = new Dictionary(opts.wordfile, opts.omitfile);
  if (opts.omit) {
    dictionary.omitWords([opts.omit]);
    dictionary.saveOmittedWords();
  }

  let histogram = new Histogram(dictionary.getWords());
  dictionary.scoreWords(histogram);
  printPastGuesses(pastGuesses, dictionary);

  let patterns = computePatterns(pastGuesses);
  console.log("patterns", patterns);
  let guesses = computeGuesses(dictionary, patterns, pastGuesses.length > 3);
  console.log("initial guesses", guesses);
  guesses = guessAtLettersNotUncovered(dictionary, patterns, guesses, pastGuesses);
  console.log("revised guesses", guesses);
  if (guesses.length === 0) guesses = computeGuesses(dictionary, patterns, true);
  if (guesses.length === 0) die("I'M STUPMPED!");
  let bestGuesses = guesses.filter((guess) => guess.score === guesses[0].score);
  console.log("bestguesses", bestGuesses);
  console.log("random best guess", bestGuesses[gmaths.random(0, bestGuesses.length - 1)].word);
}

module.exports = { main$ };

if (module.id === ".") {
  return main$();
}

function computePatterns(guesses) {
  let patterns = [];
  let must = {};
  let mustnot = {};
  for (let pos of range(0, 5)) patterns[pos] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let guess of guesses) {
    let parts = guess.toUpperCase().split("=");
    let word = parts[0];
    let answer = parts[1];
    for (let pos of range(0, 5)) {
      if (answer[pos] === "G") {
        patterns[pos] = word[pos];
        must[word[pos]] = word[pos];
      }
      if (answer[pos] === "B") {
        for (let i in range(0, 5))
          patterns[i] = remove(patterns[i], word[pos]);
        mustnot[word[pos]] = word[pos];
      }
      if (answer[pos] === "Y") {
        patterns[pos] = remove(patterns[pos], word[pos]);
        must[word[pos]] = word[pos];
      }
    }
  }
  patterns.must = Object.keys(must);
  patterns.mustnot = Object.keys(mustnot);
  return patterns;
}

function computeGuesses(dictionary, patterns, allowDups = true) {
  let list = [];

  let histogram = new Histogram(dictionary.getWords());
  dictionary.scoreWords(histogram);

  for (let entry of dictionary.getScores()) {
    let word = entry.word;
    let uniqueLetters = {};
    let pos;
    for (pos of range(0, 5)) {
      if (!patterns[pos].includes(word[pos])) break;
      uniqueLetters[word[pos]] = word[pos];
    }
    if (pos === 4) {
      if (!includesAll(word, patterns.must)) continue;
      if (Object.keys(uniqueLetters).length === 5 || allowDups) {
        list.push(entry.word);
      }
    }
  }
  let newHistogram = new Histogram(list);
  console.log("newHistogram", newHistogram.makeStrings());
  let newDictionary = new Dictionary(list, null);
  newDictionary.scoreWords(newHistogram);
  return newDictionary.getScores();
}

function guessAtLettersNotUncovered(dictionary, patterns, guesses, pastGuesses) {
  let alternatives = guesses;
  let nRemainingGuesses = 6 - pastGuesses.length;
  if (patterns.must.length >= 3 && guesses.length > nRemainingGuesses) {
    console.log("TRYING TO UNMASK OTHER LETTERS");
    let newPatterns = [];
    newPatterns.must = [];
    for (let i of range(0, patterns.length)) {
      newPatterns[i] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let c of patterns.must)
        newPatterns[i] = remove(newPatterns[i], c);
      for (let c of patterns.mustnot)
        newPatterns[i] = remove(newPatterns[i], c);
    }
    alternatives = computeGuesses(dictionary, newPatterns, false);
  }
  return alternatives;
}

function getOpts(_opts) {
  let opts =
    _opts ||
    gprocs.args(
      "--help,--omitfile=omit.txt,--omit=,--wordfile=five-letter-words.txt",
      "guess1,guess2,guess3,guess4,guess5,guess1"
    );
  if (opts.help) return help();
  for(let i of range(0, opts._files.length)) {
    let opt = opts._files[i];
    opts._files[i] = opt.toUpperCase();
    let parts = opts._files[i].split("=");
    if (
      parts.length !== 2 ||
      parts[0].length !== 5 ||
      parts[1].length !== 5 ||
      !parts[0].match("[A-Z]{5}") ||
      !parts[1].match("[BGY]{5}")
      ) die(`  Option '${opt}': invalid format`)
  }
  return opts;
}

function help() {
  console.log("\n");
  console.log("ELDROW - The Wordle Solver\n");
  console.log("USAGE: eldrow.js --help --omitfile=omit.txt --omit=WORD --wordfile=five-letter-words.txt guess1=BGYBG guess2=BGYBG...\n");
  console.log("  with no parameters, it will generate a first guess");
  console.log("  with parameters, it will generate a next guess");
  console.log("  enter guesses and results from Wordle as follows");
  console.log("  - pattern has a letter for each letter in the guess");
  console.log("  - G - for green");
  console.log("  - Y - for yellow");
  console.log("  - B - for black");
  console.log("example:");
  console.log("  $ eldrow.js");
  console.log("  CARES");
  console.log("  $ eldrow.js cares=BBBBY");
  console.log("  SOILY (-but the game doesn't know SOILY! -)");
  console.log("  $ eldrow.js cares=BBBBY --omit=SOILY");
  console.log("  SONLY");
  console.log("  $ eldrow.js cares=BBBBY SONLY=GBYBB");
  console.log("  SUINT");
  console.log("  $ eldrow.js cares=BBBBY SONLY=GBYBB");
  console.log("  SPUNK");
  console.log("  $ eldrow.js cares=BBBBY SONLY=GBYBB SPUNK=GBGGB");
  console.log("  SHUNS (- winning word -)");
  gprocs.die("");
}

function range(min, max) {
  let r = [];
  for (let i = min; i < max; i++) {
    r.push(i);
  }
  return r;
}

function remove(s, c) {
  let n = s.indexOf(c);
  if (n === -1) return s;
  let a = s.split("");
  a.splice(n, 1);
  a = a.join("");
  return a;
}

function includesAll(word, must) {
  for (let m of must) {
    if (!word.includes(m)) return false;
  }
  return true;
}

function printPastGuesses(pastGuesses, dictionary) {
  for (let guess of pastGuesses)
    console.log(
      guess,
      dictionary
        .getScores()
        .filter((dict) => dict.word === guess.substring(0, 5))
    );
}