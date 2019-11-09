window.spellingBee = {
  'grade1': {
    'easy': [],
    'average': [],
    'hard': []
  },
  'grade2': {
    'easy': [],
    'average': [],
    'hard': []
  }
}

// Cache all the relevant elements
const currentGrade = document.getElementById('currentGrade');
const currentLevel = document.getElementById('currentLevel');
const currentWord = document.getElementById('currentWord');
const previousWord = document.getElementById('previousWord');
const nextWord = document.getElementById('nextWord');
const ctas = document.querySelector('.ctas');
const wrongWords = document.querySelector('.wrong-words');
const wrongCount = document.querySelector('.wrong-count');

// The speech synthesis
// Install Tom, Daniel, and Agnes
const speech = new SpeechSynthesisUtterance();
speech.rate = 0.7;
// speech.pitch = 1;

let allVoices;

function getPrettyGradeName(gradeName) {
  switch (gradeName) {
    case 'grade1': return 'Grade 1';
    case 'grade2': return 'Grade 2';
    default: return 'Unknown Grade';
  }
}

/**
 * Get the json filename for given grade and level 
 * @param {string} grade the current grade
 * @param {string} level the current level
 */
function getFilename(grade, level) {
  return `./data/${grade}-${level}.json`;
}

/**
 * Load the JSON file for current grade and level
 * @param {string} grade the current grade
 * @param {string} level the current level
 * @return {Promise} that resolves to object that has grade, level, and all words
 */
function loadWords(grade, level) {
  return new window.Promise((resolve) => {
    if (window.spellingBee[grade][level].length) {
      resolve({
        grade,
        level,
        words: window.spellingBee[grade][level]
      })
    } else {
      const filename = getFilename(grade, level);
      window.fetch(filename)
        .then(results => results.json())
        .then((parsedResults) => resolve({
          grade,
          level,
          words: parsedResults.words
        }));
    }
  });
}

/**
 * Update the UI 
 * @param {string} grade the current grade
 * @param {string} level the current level
 * @param {Array.<string>} words the list of all words
 * @param {number} activeIdx the active index
 */
function updateUI(grade, level, words, activeIdx) {
  window.spellingBee[grade][level] = words;
  window.spellingBee.activeGrade = grade;
  window.spellingBee.activeLevel = level;
  window.spellingBee.activeIdx = activeIdx || 0;
  currentGrade.innerHTML = getPrettyGradeName(grade);
  currentLevel.innerHTML = level;
  currentWord.innerHTML = words[window.spellingBee.activeIdx];
  showPrevWord();
  showNextWord();
}

function onLevelAndGradeChange() {
  const { activeGrade, activeLevel } = window.spellingBee;
  loadWords(activeGrade, activeLevel)
  .then(result => {
    const { grade, level, words } = result;
    updateUI(grade, level, words);
  });
}

function speakCurrent() {
  const wordToSpeak = currentWord.innerHTML;

  // HACK!! Some words are more clear in en-GB speaker
  if (wordToSpeak === 'address' || wordToSpeak === 'awoke' || 
      wordToSpeak === 'world' || wordToSpeak === 'calf' ||
      wordToSpeak === 'donkey' || wordToSpeak === 'kindly' ||
      wordToSpeak === 'nook' || wordToSpeak === 'coinage' ||
      wordToSpeak === 'sheep' || wordToSpeak === 'took' ||
      wordToSpeak === 'tool' || wordToSpeak === 'weep' ||
      wordToSpeak === 'went' || wordToSpeak === 'anger' ||
      wordToSpeak === 'doing' || wordToSpeak === 'greed') {
    speech.voice = allVoices[17];
  } else if (wordToSpeak === 'themselves' || wordToSpeak ==='arch' ||
    wordToSpeak === 'called' || wordToSpeak === 'dance') {
    speech.voice = allVoices[1];
  } else {
    speech.voice = allVoices[0];
  }

  speech.text =  wordToSpeak;
  window.speechSynthesis.speak(speech);
}

function showPrevWord() {
  const activeGrade = window.spellingBee.activeGrade;
  const activeLevel = window.spellingBee.activeLevel;

  if (window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx - 1]) {
    previousWord.innerHTML = window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx - 1];
  } else {
    previousWord.innerHTML = '';
  }
}

function showNextWord() {
  const activeGrade = window.spellingBee.activeGrade;
  const activeLevel = window.spellingBee.activeLevel;

  if (window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx + 1]) {
    nextWord.innerHTML = window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx + 1];
  } else {
    nextWord.innerHTML = '';
  }
}

function loadNextWord() {
  const activeGrade = window.spellingBee.activeGrade;
  const activeLevel = window.spellingBee.activeLevel;

  if (window.spellingBee.activeIdx + 1 < window.spellingBee[activeGrade][activeLevel].length) {
    window.spellingBee.activeIdx += 1;
    currentWord.innerHTML = window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx];
    speakCurrent();
    showPrevWord();
    showNextWord();
  }
}

function loadPrevWord() {
  const activeGrade = window.spellingBee.activeGrade;
  const activeLevel = window.spellingBee.activeLevel;

  if (window.spellingBee.activeIdx - 1 >= 0) {
    window.spellingBee.activeIdx -= 1;
    currentWord.innerHTML = window.spellingBee[activeGrade][activeLevel][window.spellingBee.activeIdx];
    speakCurrent();
    showPrevWord();
    showNextWord();
  }
}

function reloadAllWrongWords(allWrongWords) {
  const { words = [] } = allWrongWords || {};

  if (Array.isArray(words)) {
    const wrongWordsCount = words.length;

    for (var idx = 0; idx < wrongWordsCount; idx++) {
      const newElem = document.createElement('li');
      newElem.innerHTML = words[idx];
      newElem.classList.add('wrong-word');

      wrongWords.appendChild(newElem);
    }
    wrongCount.innerHTML = wrongWordsCount;
  } else {
    wrongCount.innerHTML = 0;
  }
}

function markWordAsIncorrect() {
  const activeGrade = window.spellingBee.activeGrade;
  const activeLevel = window.spellingBee.activeLevel;
  const wordToBeMarked = currentWord.innerHTML;

  const newElem = document.createElement('li');
  newElem.innerHTML = `${wordToBeMarked} (${activeGrade} - ${activeLevel})`;
  newElem.classList.add('wrong-word');

  wrongWords.appendChild(newElem);
  wrongCount.innerHTML = wrongWords.childElementCount;
}

function clearWrongWordsList() {
  while (wrongWords.firstChild) {
    wrongWords.removeChild(wrongWords.firstChild);
  }
  wrongCount.innerHTML = 0;
}

function saveWrongWords() {
  const wrongWordsToSave = {
    words: []
  };

  const allWrongWords = document.querySelectorAll('.wrong-word');

  for (let idx = 0; idx < allWrongWords.length; idx++) {
    wrongWordsToSave.words.push(allWrongWords[idx].innerHTML);
  }
  window.localStorage.setItem('wrongWords', JSON.stringify(wrongWordsToSave));
}

function clearCurrentProgress() {
  window.localStorage.removeItem('activeGrade');
  window.localStorage.removeItem('activeLevel');
  window.localStorage.removeItem('activeIdx');
  window.localStorage.removeItem('wrongWords');
}

function saveCurrentProgress() {
  window.localStorage.setItem('activeGrade', window.spellingBee.activeGrade);
  window.localStorage.setItem('activeLevel', window.spellingBee.activeLevel);
  window.localStorage.setItem('activeIdx', window.spellingBee.activeIdx);
  saveWrongWords();
}

function getCurrentProgress() {
  const activeGrade = window.localStorage.getItem('activeGrade') || 'grade1';
  const activeLevel = window.localStorage.getItem('activeLevel') || 'easy';
  const activeIdx = window.localStorage.getItem('activeIdx') || 0;
  const allWrongWords = window.localStorage.getItem('wrongWords');

  return {
    activeGrade,
    activeLevel,
    activeIdx: parseInt(activeIdx, 10),
    allWrongWords: JSON.parse(allWrongWords)
  };
}

document.body.addEventListener('keydown', (event) => {
  const keyCode = event.keyCode;

  if (keyCode === 37) {  // left keypad
    loadPrevWord();
  } else if (keyCode === 39) {  // right keypad
    loadNextWord();
  } else if (keyCode === 13) {  // enter
    speakCurrent();
  } else if (keyCode === 49) {  // 1
    window.spellingBee.activeGrade = 'grade1';
    onLevelAndGradeChange();
  } else if (keyCode === 50) {  // 2
    window.spellingBee.activeGrade = 'grade2';
    onLevelAndGradeChange();
  } else if (keyCode === 69) {  // e
    window.spellingBee.activeLevel = 'easy';
    onLevelAndGradeChange();
  } else if (keyCode === 65) {  // a
    window.spellingBee.activeLevel = 'average';
    onLevelAndGradeChange();
  } else if (keyCode === 72) {  // h
    window.spellingBee.activeLevel = 'hard';
    onLevelAndGradeChange();
  } else if (keyCode === 77) {  // m
    markWordAsIncorrect();
  } else if (keyCode === 67) { // c
    clearWrongWordsList();
  } else if (keyCode === 83) { // s
    saveCurrentProgress();
  } else if (keyCode === 68) { // d
    clearCurrentProgress();
  }
});

// Save currnent progress when we quit the app
window.onbeforeunload = saveCurrentProgress;

function onUiStarted() {
  // Get previously saved progress
  const { 
    activeGrade,
    activeLevel,
    activeIdx,
    allWrongWords 
  } = getCurrentProgress();

  // Set the active grade and level
  window.spellingBee.activeGrade = activeGrade;
  window.spellingBee.activeLevel = activeLevel;

  // Display all wrong words from previous session
  reloadAllWrongWords(allWrongWords);

  // Load the words for this particular grade and level
  loadWords(window.spellingBee.activeGrade, window.spellingBee.activeLevel)
  .then(result => {
    const { grade, level, words } = result;
    updateUI(grade, level, words, activeIdx);
  });
}

window.speechSynthesis.onvoiceschanged = function() {
  allVoices = window.speechSynthesis.getVoices();
  // console.log(allVoices);
  onUiStarted();
}