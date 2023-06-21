# ELDROW - The Wordle Solver
<!-- gitComment(README file) -->
## Command
`USAGE: eldrow.js --help --omitfile=omit.txt --omit=WORD --wordfile=five-letter-words.txt guess1=BGYBG guess2=BGYBG...`

*  with no parameters, it will generate a first guess
*  with parameters, it will generate a next guess
*  enter guesses and results from Wordle as follows
   - pattern has a letter for each letter in the guess
   - G - for green
   - Y - for yellow
   - B - for black
* If `eldrow` guesses a word that `Wordle` doesn't know, you can omit it (permantly) with the `--omit=WORD` option
  
## Example:
```
  $ eldrow.js
  CARES
  $ eldrow.js cares=BBBBY
  SOILY (-but the game doesn't know SOILY! -)
  $ eldrow.js cares=BBBBY --omit=SOILY
  SONLY
  $ eldrow.js cares=BBBBY SONLY=GBYBB
  SUINT
  $ eldrow.js CARES=BBBBY SONLY=GBYBB SUINT=GYBGB
  SPUNK
  $ eldrow.js CARES=BBBBY SONLY=GBYBB SUINT=GYBGB SPUNK=GBGGB
  SHUNS (- winning word -)
```

## Notes

### Basic Algorithm
The algorithm is pretty simple. 
* read a file of 5-letter words culled from a Scrabble dictionary.
* compute the frequency of occurrence of each letter for every word in the dictionary
  * note: I compute the frequency for each "column" or "position" in the words
  * for example: 
  * 'S' is most frequent in the first and last positions
  * 'A' is most frequent in the second and third positions
  * 'E' is most frequent in the fourth position
* Score each word
  * for each position, find the "priority" of the letter (eg: S=0 for the first position, C=1 for the second position, etc)
  * sum these "priorities" across the 5 letters of the word
* Sort the scores.
* Compute valid Patterns for each position
  * start with all letters in the alphabet (A-Z)
  * (Also, keep a list of all the "must have" letters)
  * for each "B" (black) remove that letter from all positions
  * for each "G" (green) set that position to that letter (and add it to the "must have" list)
  * for each "Y" (yellow) remove that letter from that position (and add it to the "must have" list)
  * for example: if the guess is CARES=BBBBG plus SONLY=GBYBB
    * pattern-1: 'S',
    * pattern-2: '-B-D-FGHIJK-MN-PQ-STUVWXZ',
    * pattern-3: '-B-D-FGHIJK-M--PQ-STUVWXZ',
    * pattern-4: '-B-D-FGHIJK-MN-PQ-STUVWXZ',
    * pattern-5: '-B-D-FGHIJK-MN-PQ--TUVWXZ',
    * must-have: [ 'S', 'N' ],
* Compare every word in the dictionary to the patterns and sort them by 'score'
* The top word is your next guess

### Addtional logic
* The first few guesses do not allow duplicate letters in the guessed words
  * this promotes trying a variety of different letters
* If there are too few letters in the "must-have" list, 
  * we look for words with other letters than the "must-have"
  * for example if you have 3 guesses left, and you've only identified 2 of the letters
  * (say, 'S' and 'N')
  * `eldrow` will start guessing words that do not include 'S' and 'N' to use those spots to find the missing letters
* If there are a number of words with equal score, `eldrow` will pick one at random

## I'm Stumped"