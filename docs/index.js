const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),gameTime=60;let gameTimer,firstRun=!0,answer="Type Numbers",catCounter=0,correctCount=0,allVoices=[];const audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("error","mp3/cat.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/incorrect1.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(b,c){const d=await loadAudio(b,audioBufferCache[b]),a=audioContext.createBufferSource();if(a.buffer=d,c){const b=audioContext.createGain();b.gain.value=c,b.connect(audioContext.destination),a.connect(b),a.start()}else a.connect(audioContext.destination),a.start()}async function loadAudio(a,c){if(audioBufferCache[a])return audioBufferCache[a];const d=await fetch(c),e=await d.arrayBuffer(),b=await audioContext.decodeAudioData(e);return audioBufferCache[a]=b,b}function unlockAudio(){audioContext.resume()}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),b=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];a.then(a=>{allVoices=a.filter(a=>!b.includes(a.voiceURI)),addLangRadioBox()})}loadVoices();function speak(c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(c),d=document.getElementById("langRadio").elements.lang.value,b=allVoices.filter(a=>a.lang==d);return a.voice=b[Math.floor(Math.random()*b.length)],a.lang=document.getElementById("langRadio").elements.lang.value,speechSynthesis.speak(a),a}function addLangRadioBox(){const a=document.getElementById("langRadio");a.replaceChildren();const b=allVoices.map(a=>a.lang),c=[...new Set(b)];c.forEach(c=>{const e=document.createElement("div");e.className="form-check form-check-inline";const b=document.createElement("input");b.className="form-check-input",b.name="lang",b.type="radio",b.value=c;const d=document.createElement("label");d.className="from-check-label",d.textContent=c,d.appendChild(b),e.appendChild(d),a.appendChild(e),(c=="en-US"||c=="en_US")&&(b.checked=!0)})}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function hideAnswer(){document.getElementById("reply").textContent=""}function sleep(a){return new Promise(b=>setTimeout(b,a))}function showAnswer(){const a=speak(answer);firstRun||(a.onend=async()=>{await sleep(1e3),nextProblem()}),document.getElementById("reply").textContent=answer}function nextProblem(){hideAnswer();const a=document.getElementById("grade").selectedIndex+1,b=Math.pow(10,a);answer=getRandomInt(0,b).toString(),speak(answer)}function catNyan(){playAudio("error")}function loadImage(a){return new Promise((c,d)=>{const b=new Image;b.onload=()=>c(b),b.onerror=a=>d(a),b.src=a})}function loadCatImage(b){const a=128;return new Promise(c=>{loadImage(b).then(d=>{const b=document.createElement("canvas");b.setAttribute("role","button"),b.width=a,b.height=a,b.style.position="absolute",b.getContext("2d").drawImage(d,0,0),c(b)}).catch(a=>{console.log(a)})})}loadCatImage("kohacu.webp").then(a=>{catsWalk(a)});function catWalk(g,d){const c=document.getElementById("catsWalk"),e=c.offsetWidth,f=c.offsetHeight,a=d.cloneNode(!0);a.getContext("2d").drawImage(d,0,0);const b=128;a.style.top=getRandomInt(0,f-b)+"px",a.style.left=e-b+"px",a.addEventListener("click",()=>{catCounter+=1,speak(catCounter),a.remove()},{once:!0}),c.appendChild(a);const h=setInterval(()=>{const c=parseInt(a.style.left)-1;c>-b?a.style.left=c+"px":(clearInterval(h),a.remove())},g)}function catsWalk(a){setInterval(()=>{Math.random()>.995&&catWalk(getRandomInt(5,20),a)},10)}function countdown(){firstRun=!1,correctCount=0,countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3;const b=setInterval(()=>{const c=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const b=parseInt(a.textContent)-1;a.style.backgroundColor=c[b],a.textContent=b}else clearTimeout(b),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),nextProblem(),startGameTimer()},1e3)}function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=correctCount}function initCalc(){const a=document.getElementById("reply");document.getElementById("be").onclick=()=>{speak(answer)},document.getElementById("bc").onclick=()=>{a.textContent=""};for(let b=0;b<10;b++){const c=document.getElementById("b"+b);c.onclick=()=>{let b=a.textContent;b+=c.getAttribute("id").slice(-1),a.textContent=b.slice(0,8),answer==b?(playAudio("correct"),a.textContent="",correctCount+=1,nextProblem()):answer.slice(0,b.length)!=b&&playAudio("incorrect")}}}initCalc(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("kohacu").onclick=catNyan,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})