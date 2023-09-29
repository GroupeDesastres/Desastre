// Global variable that will be populated with dictionaries (json files)
let dictionaries = {};

function convert(text) {
  let dictionary = getDictionary();
  let output = "";
  text = normalize(text);
  for(let i=0; i<text.length; i++)
    output += convertChar(text[i], dictionary);
  return output;
}

function convertChar(c, dictionary) {
  if(!dictionary["case-sensitive"])
    c = c.toUpperCase();
  return c in dictionary["matches"] ? dictionary["matches"][c] : dictionary["default"];
}

function dictionarySelectBoxAdd(dictionary) {
  let option = document.createElement("option");
  option.value = dictionary["id"];
  option.textContent = dictionary["label"];
  document.getElementById("dictionary").add(option);
}

function formatOutput(source, format) {
      let chordsDict = getChordsDict(source);
      let wordsArray = getWords(source);
      let outputArray = [];
      for(let word of wordsArray) {
        let chord = chordsDict[word];
        if(format == "chords") {
          outputArray.push(chord);
        }
        else if(format == "words-chords") {
          if(chord != "")
            outputArray.push([word, chord].join(" - "));
          else
            outputArray.push(word);
        }
      }
      return outputArray.join("\n")
}

function getChordsDict(content) {
  let words = Array.from(new Set(getWords(content)));  // remove duplicate words
  let chords = {};
  for(let word of words) {
    let letters = word.split("");
    let notes = [];
    for(let letter of letters) {
      let note = convert(letter);
      if(note != "")
        notes.push(note);
    }
    chords[word] = notes.join("-");
  }
  return chords;
}

function getDictionary() {
  return dictionaries[document.getElementById("dictionary").value];
}

function getWords(content) {
  return content.replace(/[\n\r]/g," ").split(" ");
}

function loadBody() {
  loadDictionaries();
}

function loadDictionaries() {
  fetch("./dictionaries.json")
    .then(response => response.json())
    .then(json => {
      for(let dictionary of json) {
        dictionaries[dictionary["id"]] = dictionary;
        dictionarySelectBoxAdd(dictionary);
      }
    })
}

function normalize(text) {
  return text.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
}

function render() {
  if(!validateDictionary())
    return
  let sourceEl = document.getElementById("text-source");
  let outputEl = document.getElementById(sourceEl.dataset.target);
  let outputFormat = document.getElementById("format-output").value;
  let source = sourceEl.value;
  let output = "";
  switch(outputFormat) {
    case "chords":
    case "words-chords":
      output = formatOutput(source, outputFormat);
      break;
    case "raw":
    default:
      output = convert(source);
  }
  outputEl.value = output;
}

function validateDictionary() {
  let dictionary = document.getElementById("dictionary").value;
  if(dictionary == "") {
    alert("Pas de dictionnaire sélectionné");
    return false;
  }
  if(!(dictionary in dictionaries)) {
    alert("Dictionnaire sélectionné inconnu (???)");
    return false;
  }
  return true;
}
