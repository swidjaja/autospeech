const fs = require('fs');

// Add additional files here
const files = [
  'grade1-easy',
  'grade1-average',
  'grade1-hard',
  'grade2-easy',
  'grade2-average',
  'grade2-hard'
];

for (let idx = 0; idx < files.length; idx += 1) {
  const file = files[idx];
  const inputFile = `./raw_data/${file}.csv`;
  const outputFile = `./data/${file}.json`;
  const outputs = {
    words: []
  };

  console.log(`Reading raw data from file ${inputFile}`);
  const allWords = fs.readFileSync(inputFile).toString().split('\r');
  allWords.forEach((word) => {
    outputs.words.push(word.trim());
  });

  const jsonOutput = JSON.stringify(outputs);
  fs.writeFile(outputFile, jsonOutput, () => {
    console.log(`Successfully writing to file ${outputFile}`);
  });
}