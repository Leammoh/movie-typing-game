const movies = [
  {id:"terminator1", title:"TERMINATOR", subtitle:"Film 1", folder:"movies/terminator1", scenes:[
    {file:"scene01.mp4", type:"ACTION", hint:"Exemple — remplace ce texte", text:"Tape ici la phrase de ta scène."},
    {file:"scene02.mp4", type:"ACTION", hint:"Scène suivante", text:"Une deuxième phrase peut déclencher la suite."}
  ]},
  {id:"terminator2", title:"TERMINATOR 2", subtitle:"Judgment Day", folder:"movies/terminator2", scenes:[
    {file:"scene01.mp4", type:"ACTION", hint:"Scène 1", text:"Tape la phrase correspondant à ta vidéo."},
    {file:"scene02.mp4", type:"ACTION", hint:"Scène 2", text:"La vidéo continue lorsque la phrase est correcte."}
  ]},
  {id:"aliens", title:"ALIENS", subtitle:"Action / SF", folder:"movies/aliens", scenes:[
    {file:"scene01.mp4", type:"ACTION", hint:"Scène 1", text:"Ajoute ici ton texte sous licence."},
    {file:"scene02.mp4", type:"ACTION", hint:"Scène 2", text:"Puis ajoute une seconde phrase."}
  ]},
  {id:"robocop1", title:"ROBOCOP", subtitle:"Film 1", folder:"movies/robocop1", scenes:[
    {file:"scene01.mp4", type:"ACTION", hint:"Scène 1", text:"Phrase de la scène à saisir ici."},
    {file:"scene02.mp4", type:"ACTION", hint:"Scène 2", text:"Phrase suivante de la séquence."}
  ]},
  {id:"robocop2", title:"ROBOCOP 2", subtitle:"Action", folder:"movies/robocop2", scenes:[
    {file:"scene01.mp4", type:"ACTION", hint:"Scène 1", text:"Texte de démonstration à remplacer."},
    {file:"scene02.mp4", type:"ACTION", hint:"Scène 2", text:"Texte de démonstration à remplacer."}
  ]}
];

const $ = id => document.getElementById(id);
const home = $("home"), game = $("game"), results = $("results");
const movieGrid = $("movieGrid"), video = $("movieVideo"), input = $("typingInput");
const target = $("targetText"), typed = $("typedText"), bar = $("progressBar");
const feedback = $("feedback"), movieTitle = $("movieTitle"), sceneLabel = $("sceneLabel");
const scoreEl = $("score"), comboEl = $("combo"), accuracyEl = $("accuracy"), timerEl = $("timer");

let movieIndex=0, sceneIndex=0, score=0, combo=0, errors=0, attempts=0, correctChars=0;
let startedAt=0, timerId=null, completed=false, lastInputLength=0;

function renderMovieMenu(){
  movieGrid.innerHTML = "";
  movies.forEach((m,i)=>{
    const b=document.createElement("button");
    b.className="movie-card";
    b.innerHTML=`<span class="number">0${i+1}</span><h3>${m.title}</h3><p>${m.subtitle}</p>`;
    b.addEventListener("click",()=>startMovie(i));
    movieGrid.appendChild(b);
  });
}

function startMovie(i){
  movieIndex=i; sceneIndex=0; score=0; combo=0; errors=0; attempts=0; correctChars=0;
  startedAt=Date.now(); clearInterval(timerId); timerId=setInterval(updateTimer,100);
  home.classList.add("hidden"); results.classList.add("hidden"); game.classList.remove("hidden");
  loadScene();
}

function loadScene(){
  completed=false; lastInputLength=0;
  const m=movies[movieIndex], s=m.scenes[sceneIndex];
  movieTitle.textContent=m.title;
  sceneLabel.textContent=`Scène ${sceneIndex+1} / ${m.scenes.length}`;
  $("sceneType").textContent=s.type || "ACTION";
  $("sceneHint").textContent=s.hint || "";
  target.textContent=s.text;
  typed.textContent="";
  input.value="";
  bar.style.width="0%";
  feedback.textContent="Prêt.";
  feedback.style.color="#777";

  video.pause();
  video.src=`${m.folder}/${s.file}`;
  video.load();

  video.play().catch(()=>{
    $("videoMessage").classList.remove("hidden");
    feedback.textContent="Clique sur la vidéo si ton navigateur bloque la lecture automatique.";
  });

  updateHUD();
  setTimeout(()=>input.focus(),150);
}

video.addEventListener("click",()=>{
  video.play().then(()=>$("videoMessage").classList.add("hidden")).catch(()=>{});
});

input.addEventListener("input",()=>{
  if(completed) return;
  const wanted=movies[movieIndex].scenes[sceneIndex].text;
  const value=input.value;
  typed.textContent=value;

  // On compte une tentative uniquement quand un nouveau caractère est saisi.
  if(value.length>lastInputLength){
    attempts++;
    if(wanted[value.length-1] !== value[value.length-1]){
      errors++;
      combo=0;
      feedback.textContent="Erreur de frappe";
      feedback.style.color="#ff7070";
    }
  }
  lastInputLength=value.length;

  let same=0;
  while(same<value.length && same<wanted.length && value[same]===wanted[same]) same++;
  correctChars=Math.max(correctChars,same);

  const pct=Math.min(100,(same/wanted.length)*100);
  bar.style.width=pct+"%";
  accuracyEl.textContent=getAccuracy()+"%";

  if(value===wanted) completeScene();
});

function completeScene(){
  completed=true;
  combo++;
  const bonus=500+combo*100+Math.max(0,200-errors*10);
  score+=bonus;
  feedback.textContent="✓ Séquence validée";
  feedback.style.color="#fff";
  updateHUD();

  setTimeout(()=>{
    sceneIndex++;
    if(sceneIndex>=movies[movieIndex].scenes.length) endGame();
    else loadScene();
  },850);
}

function getAccuracy(){
  if(attempts===0) return 100;
  return Math.max(0,Math.round((attempts-errors)/attempts*100));
}

function updateHUD(){
  scoreEl.textContent=score;
  comboEl.textContent=combo;
  accuracyEl.textContent=getAccuracy()+"%";
}

function updateTimer(){
  if(!startedAt)return;
  timerEl.textContent=formatTime(Date.now()-startedAt);
}

function formatTime(ms){
  const s=Math.floor(ms/1000), min=Math.floor(s/60), sec=s%60;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function endGame(){
  clearInterval(timerId); video.pause();
  $("finalScore").textContent=score;
  $("finalAccuracy").textContent=getAccuracy()+"%";
  $("finalTime").textContent=formatTime(Date.now()-startedAt);
  $("finalErrors").textContent=errors;
  $("resultTitle").textContent=`${movies[movieIndex].title} terminé`;
  game.classList.add("hidden"); results.classList.remove("hidden");
}

$("backBtn").addEventListener("click",()=>{
  clearInterval(timerId); video.pause(); game.classList.add("hidden"); home.classList.remove("hidden");
});
$("filmsBtn").addEventListener("click",()=>{
  results.classList.add("hidden"); home.classList.remove("hidden");
});
$("replayBtn").addEventListener("click",()=>startMovie(movieIndex));

renderMovieMenu();
