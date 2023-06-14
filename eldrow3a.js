#!/usr/bin/env node

/**
 * solve wordle
 **/

const glstools = require("glstools");
const gprocs = glstools.procs;
const gfiles = glstools.files;
const gmaths = glstools.maths;
const { die } = require("glstools/js/glsprocs");
const { Dictionary } = require("./Dictionary");
const { Histogram } = require("./Histogram");
let bigDictionary;

async function main$(_opts) {
  let opts = gprocs.args("--wordfile=five-letter-words.txt,--db=saint.json", "guess1=,guess2=");
  console.log(opts);
  let database = gfiles.readJSON(opts.db);
  if (opts.guess1) {
    // SAINT
    let words = opts.guess1.split("=");
    let word = words[0];
    let answer = words[1];
    let response = database[word].answers[answer];
    console.log(response);
  } else {
  }
}

function score(answer) {
  let s = 0;
  for (let c of answer) {
    if (c === "G") s += 10;
    else if (c === "Y") s += 1;
  }
  return s;
}
function wordleAllWords(database, dictionary) {
  for (let word of dictionary) {
    let result = wordle(word, database.guess);
    let answer = database.answers[result];
    if (!answer) {
      answer = { answer: result, words: [] };
      database.answers[result] = answer;
    }
    answer.words.push(word);
  }
}

function wordle(word, guess) {
  let a = ["B", "B", "B", "B", "B"];
  // find GREENS
  for (let i = 0; i < word.length; i++) {
    if (word[i] === guess[i]) a[i] = "G";
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

module.exports = { main$ };

if (module.id === ".") {
  return main$();
}
