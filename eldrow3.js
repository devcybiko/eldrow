#!/usr/bin/env node

/**
 * gitComment(wordle Solver using frequency of occurance of words in English corpus)
 * solve wordle
 **/

const glstools = require("glstools");
const gprocs = glstools.procs;
const gfiles = glstools.files;
const gmaths = glstools.maths;
const { die } = require("glstools/js/glsprocs");
const { Dictionary } = require("./Dictionary");
const { Histogram } = require("./Histogram");
let freq;

function log() {
  // console.log(...arguments);
}

async function main$(_opts) {
  let opts = gprocs.args("--test,--wordfile=five-letter-words-by-freq-of-occurrance.csv", "");
  log(opts);
  let dictionary = gfiles.readList(opts.wordfile);
  dictionary.forEach((value, index, array) => array[index] = value.toUpperCase().trim());
  freq = {};
  let lines = gfiles.readList(opts.wordfile)
  lines.forEach((value, index, array) => {
    value = value.toUpperCase().trim();
    let words = value.split(",");
    let word = words[0];
    let score = +words[1];
    freq[word] = score;
  }
  );
  if (opts.test) {
    console.log("test");
    test(dictionary);
    return;
  } else {
    let results = playWordle(opts._files, dictionary);
    console.log(results);
  }
}

function allWordle(dictionary, guess, answer) {
  let potentials = [];
  console.log(guess, answer)
  if (!guess) {
    potentials = dictionary;
  }
  else {
    for (let word of dictionary) {
      if (word === guess) continue;
      let xxx = wordle(guess, word);
      if (answer === xxx) {
        potentials.push(word);
      }
    }
  }

  let list = potentials
  let maxWord = list[0];
  let max = 0;
  let maxList = [maxWord];
  console.log({list})
  if (list.length > 1) {
    max = 0;
    maxWord = list[0];
    for (let word of list) {
      let f = freq[word];
      if (f > max) {
        max = f;
        maxWord = word;
        maxList = [word];
        log(max, maxWord)
      } else if (f === max) {
        maxWord = word;
        maxList.push(word);
        log(f, maxWord)
      }
    }
  }
  let r = Math.floor(Math.random() * maxList.length);
  maxWord = maxList[r];
  console.log({maxList})
  return { newGuess: maxWord, potentials };
}

function wordle(word, guess) {
  let a = ["B", "B", "B", "B", "B"];
  // find GREENS
  for (let i = 0; i < word.length; i++) {
    if (word[i] === guess[i]) {
      a[i] = "G";
      guess = guess.substring(0, i) + " " + guess.substring(i + 1);
      word = word.substring(0, i) + "." + word.substring(i + 1);
    }
  }
  // find YELLOWS
  for (let i = 0; i < word.length; i++) {
    if (a[i] === "G") continue;
    for (let j = 0; j < guess.length; j++) {
      if (i === j) continue;
      if (word[i] === guess[j]) {
        a[i] = "Y";
        break;
      }
    }
  }
  return a.join("");
}

function score(answer) {
  let sum = 0;
  for (let c of answer) {
    if (c === "G") sum += 10;
    else if (c === "Y") sum += 1;
  }
  return sum;
}
module.exports = { main$ };

if (module.id === ".") {
  return main$();
}

function playWordle(guesses, dictionary) {
  let result = {};
  if (guesses.length === 0) {
    result = allWordle(dictionary);
  } else {
    for (let _guess of guesses) {
      let items = _guess.toUpperCase().split("=");
      let guess = items[0];
      log("...", "...", "playWordle", guess);
      let answer = items[1];
      result = allWordle(dictionary, guess, answer);
      dictionary = result.potentials;
    }
  }
  return result;
}

function testWordle(word, dictionary) {
  let guesses = [];
  let i;
  for (i = 0; i < 6; i++) {
    let results = playWordle(guesses, dictionary);
    let answer = wordle(results.newGuess, word);
    guesses.push(results.newGuess + "=" + answer);
    log("...", "testWorld", results.newGuess, guesses);
    if (answer === "GGGGG") break;
  }
  return i+1;
}
function test(dictionary) {
  let i = 0;
  let list =[];
  for (let word of dictionary) {
    log("test", word);
    let tries = testWordle(word, dictionary);
    console.log(word, tries);
    i++;
    list.push({word, tries});
    console.log(i, word, tries)
  }
  list.sort((a,b) => a.tries - b.tries);
  gfiles.writeJSON("a.json", list);
}
