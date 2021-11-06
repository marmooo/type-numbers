let endAudio, errorAudio, incorrectAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let firstRun = true;
let answer = "Type Numbers";
let catCounter = 0;
let allVoices = [];

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/cat.mp3"),
    loadAudio("mp3/incorrect1.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    errorAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    correctAudio = audioBuffers[3];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", function () {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  allVoicesObtained.then((voices) => {
    allVoices = voices;
    addLangRadioBox();
  });
}
loadVoices();

function speak(text) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  const lang = document.getElementById("langRadio").lang.value;
  const voices = allVoices.filter((voice) => voice.lang == lang);
  msg.voice = voices[Math.floor(Math.random() * voices.length)];
  msg.lang = document.getElementById("langRadio").lang.value;
  speechSynthesis.speak(msg);
  return msg;
}

function addLangRadioBox() {
  const radio = document.getElementById("langRadio");
  allVoices.sort((a, b) => {
    if (a.lang < b.lang) return -1;
    if (a.lang > b.lang) return 1;
    return 0;
  }).forEach((voice, i) => {
    const div = document.createElement("div");
    div.className = "form-check form-check-inline";
    const input = document.createElement("input");
    input.className = "form-check-input";
    input.name = "lang";
    input.type = "radio";
    input.id = "radio" + i;
    input.value = voice.lang;
    const label = document.createElement("label");
    label.className = "from-check-label";
    label.for = "radio" + i;
    label.textContent = voice.lang;
    div.appendChild(input);
    div.appendChild(label);
    radio.appendChild(div);
    if (voice.lang == "en-US" || voice.lang == "en_US") {
      input.checked = true;
    }
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  document.getElementById("reply").textContent = "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showAnswer() {
  const msg = speak(answer);
  if (!firstRun) {
    msg.onend = async () => {
      await sleep(1000);
      nextProblem();
    };
  }
  document.getElementById("reply").textContent = answer;
}

function nextProblem() {
  hideAnswer();
  const grade = document.getElementById("grade").selectedIndex + 1;
  const max = Math.pow(10, grade);
  answer = getRandomInt(0, max).toString();
  speak(answer);
}

function catNyan() {
  playAudio(errorAudio);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function loadCatImage(url) {
  const imgSize = 128;
  return new Promise((resolve) => {
    loadImage(url).then((originalImg) => {
      const canvas = document.createElement("canvas");
      canvas.width = imgSize;
      canvas.height = imgSize;
      canvas.style.position = "absolute";
      // drawImage() faster than putImageData()
      canvas.getContext("2d").drawImage(originalImg, 0, 0);
      resolve(canvas);
    }).catch((e) => {
      console.log(e);
    });
  });
}
loadCatImage("kohacu.webp").then((catCanvas) => {
  catsWalk(catCanvas);
});

function catWalk(freq, catCanvas) {
  const area = document.getElementById("catsWalk");
  const width = area.offsetWidth;
  const height = area.offsetHeight;
  const canvas = catCanvas.cloneNode(true);
  canvas.getContext("2d").drawImage(catCanvas, 0, 0);
  const size = 128;
  canvas.style.top = getRandomInt(0, height - size) + "px";
  canvas.style.left = width - size + "px";
  canvas.addEventListener("click", function () {
    catCounter += 1;
    speak(catCounter);
    this.remove();
  }, { once: true });
  area.appendChild(canvas);
  const timer = setInterval(function () {
    const x = parseInt(canvas.style.left) - 1;
    if (x > -size) {
      canvas.style.left = x + "px";
    } else {
      clearInterval(timer);
      canvas.remove();
    }
  }, freq);
}

function catsWalk(catCanvas) {
  setInterval(function () {
    if (Math.random() > 0.995) {
      catWalk(getRandomInt(5, 20), catCanvas);
    }
  }, 10);
}

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  timeNode.textContent = "60秒 / 60秒";
  gameTimer = setInterval(function () {
    const arr = timeNode.textContent.split("秒 /");
    const t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.textContent = (t - 1) + "秒 /" + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  firstRun = false;
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  countdownTimer = setInterval(function () {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      playPanel.classList.remove("d-none");
      document.getElementById("score").textContent = 0;
      nextProblem();
      startGameTimer();
    }
  }, 1000);
}

function initCalc() {
  const replyObj = document.getElementById("reply");
  const scoreObj = document.getElementById("score");
  document.getElementById("be").onclick = function () {
    speak(answer);
  };
  document.getElementById("bc").onclick = function () {
    replyObj.textContent = "";
  };
  for (let i = 0; i < 10; i++) {
    document.getElementById("b" + i).onclick = function () {
      let reply = replyObj.textContent;
      reply += this.getAttribute("id").slice(-1);
      replyObj.textContent = reply.slice(0, 8);
      if (answer == reply) {
        playAudio(correctAudio);
        replyObj.textContent = "";
        scoreObj.textContent = parseInt(scoreObj.textContent) + 1;
        nextProblem();
      } else if (answer.slice(0, reply.length) != reply) {
        playAudio(incorrectAudio);
      }
    };
  }
}

initCalc();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("kohacu").onclick = catNyan;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
