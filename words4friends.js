#!/usr/bin/env node

/**
 * basic algorithm uses frequency of occurance of letters
 **/

const glstools = require("glstools");
const gprocs = glstools.procs;
const gmaths = glstools.maths;
const gfiles = glstools.files;
const { die } = require("glstools/js/glsprocs");

let dictionary = {};
let tiles = {};

function score(word) {
	let result = 0;
	for(let c of word) {
		result += tiles[c];
	}
	return result;
}


function combos(before, letters, after) {
	before = (before || "").toUpperCase();
	letters = (letters || "").toUpperCase();
	after = (after || "").toUpperCase();

	let results = [];
	let n = 1 << letters.length;
	for(let i=0; i<n; i++) {
		let s = before;
		for(let j=0; j<letters.length; j++) {
			if (i & (1 << j)) s += letters[j];
		}
		s += after;
		if (dictionary[s]) results.push([s, score(s)]);
	}
	return results;
}

async function main$(_opts) {
	let opts = gprocs.args( "--dictionary=words.json", "before,letters,after");
	console.log(opts);
	dictionary = gfiles.readJSON(opts.dictionary);
	tiles = gfiles.readJSON("tiles.json");
	let words = combos(opts.before, opts.letters, opts.after);
	words.sort((a, b) => b[1] - a[1]);
	console.log(words);
}

main$();
