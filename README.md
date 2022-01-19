# ELDROW - The Wordle Solver

## Command
`eldrow guess1=pattern guess2=pattern...`

*  with no parameters, it will generate a first guess
*  with parameters, it will generate a next guess
*  enter guesses and results from Wordle as follows
   - pattern has a letter for each letter in the guess
   - G - for green
   - Y - for yellow
   - B - for black
  
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
  $ eldrow.js cares=BBBBY SONLY=GBYBB
  SPUNK
  $ eldrow.js cares=BBBBY SONLY=GBYBB SPUNK=GBGGB
  SHUNS (- winning word -)
```