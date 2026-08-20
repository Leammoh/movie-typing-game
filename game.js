const $ = (id) => document.getElementById(id);

const video = $("movieVideo");
const input = $("typingInput");
const targetText = $("targetText");
const typedText = $("typedText");
const progressBar = $("progressBar");
const feedback = $("feedback");

const scoreEl = $("score");
const comboEl = $("combo");
const accuracyEl = $("accuracy");
const timerEl = $("timer");

const startBtn = $("startBtn");
const againBtn = $("againBtn");

const gamePanel = $("game");
const homePanel = $("home");
const endPanel = $("end");

const finalScore = $("finalScore");

const TEST_VIDEO = "movies/test/scene01.mp4";

/*
  Phrase utilisée pour la vidéo de test.
  Chaque caractère correctement tapé fait avancer
  la vidéo proportionnellement.
*/
const TEST_TEXT = "LA SCENE COMMENCE";

let score = 0;
let combo = 0;
let errors = 0;
let correctChars = 0;
let totalChars = 0;
let startTime = 0;
let timerInterval = null;
let finished = false;

function resetGame() {
  score = 0;
  combo = 0;
  errors = 0;
  correctChars = 0;
  totalChars = 0;
  finished = false;

  scoreEl.textContent = "0";
  comboEl.textContent = "0";
  accuracyEl.textContent = "100%";
  timerEl.textContent = "00:00";

  targetText.textContent = TEST_TEXT;
  typedText.textContent = "";
  feedback.textContent = "Tape la phrase pour faire avancer la vidéo.";

  progressBar.style.width = "0%";

  input.value = "";

  video.pause();
  video.currentTime = 0;
}

function updateStats() {
  const accuracy =
    totalChars === 0
      ? 100
      : Math.max(0, Math.round((correctChars / totalChars) * 100));

  accuracyEl.textContent = accuracy + "%";
  scoreEl.textContent = score;
  comboEl.textContent = combo;
}

function updateTimer() {
  if (!startTime) return;

  const seconds = Math.floor((Date.now() - startTime) / 1000);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  timerEl.textContent = `${minutes}:${secs}`;
}

function startTimer() {
  clearInterval(timerInterval);

  startTime = Date.now();

  timerInterval = setInterval(updateTimer, 250);
}

function startGame() {
  resetGame();

  homePanel.classList.add("hidden");
  endPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");

  video.src = TEST_VIDEO;
  video.load();

  startTimer();

  input.focus();

  /*
    On ne lance pas la vidéo automatiquement.
    Elle avancera directement avec la frappe.
  */
}

function updateVideoFromTyping() {
  const typedLength = input.value.length;
  const totalLength = TEST_TEXT.length;

  const ratio = Math.min(typedLength / totalLength, 1);

  /*
    La vidéo de test dure environ 12 secondes.
    currentTime permet de positionner précisément
    la vidéo en fonction de la progression.
  */
  if (video.duration && Number.isFinite(video.duration)) {
    video.currentTime = video.duration * ratio;
  }

  const percent = ratio * 100;

  progressBar.style.width = percent + "%";

  typedText.textContent = input.value;
}

function finishGame() {
  if (finished) return;

  finished = true;

  clearInterval(timerInterval);

  video.pause();

  finalScore.textContent = score;

  gamePanel.classList.add("hidden");
  endPanel.classList.remove("hidden");
}

input.addEventListener("input", () => {
  if (finished) return;

  const currentValue = input.value;
  const expected = TEST_TEXT.substring(0, currentValue.length);

  totalChars++;

  /*
    On vérifie que tout ce qui est déjà tapé
    correspond bien au début de la phrase.
  */
  if (currentValue === expected) {
    correctChars++;

    combo++;

    score += 10 + combo;

    feedback.textContent = "✓ Correct";

    updateVideoFromTyping();

    /*
      Si toute la phrase est correcte,
      la scène arrive à 100 %.
    */
    if (currentValue === TEST_TEXT) {
      progressBar.style.width = "100%";

      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = video.duration;
      }

      feedback.textContent = "🎬 Scène terminée !";

      setTimeout(finishGame, 800);
    }
  } else {
    errors++;

    combo = 0;

    /*
      Une erreur ne fait pas avancer la vidéo.
    */
    feedback.textContent = "✗ Erreur — corrige ta frappe.";

    /*
      On remet le champ à la dernière partie correcte.
    */
    let correctPart = "";

    for (
      let i = 0;
      i < currentValue.length && i < TEST_TEXT.length;
      i++
    ) {
      if (currentValue[i] === TEST_TEXT[i]) {
        correctPart += currentValue[i];
      } else {
        break;
      }
    }

    input.value = correctPart;

    updateVideoFromTyping();
  }

  updateStats();
});

startBtn.addEventListener("click", startGame);

againBtn.addEventListener("click", startGame);

video.addEventListener("loadedmetadata", () => {
  video.currentTime = 0;
});

video.addEventListener("error", () => {
  feedback.textContent =
    "⚠️ Impossible de charger la vidéo. Vérifie movies/test/scene01.mp4";
});

/*
  Initialisation
*/
resetGame();
