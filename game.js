const $ = (id) => document.getElementById(id);

// -----------------------------
// Éléments HTML
// -----------------------------
const startBtn = $("startBtn");
const againBtn = $("againBtn");

const gamePanel = $("game");
const endPanel = $("end");

const video = $("video");
const input = $("typing");

const phrase = $("phrase");
const bar = $("bar");
const status = $("status");

const scoreEl = $("score");
const accuracyEl = $("accuracy");
const finalScoreEl = $("finalScore");

// -----------------------------
// Configuration du test
// -----------------------------
const TEST_VIDEO = "movies/test/scene01.mp4";
const TEST_TEXT = "La scène commence.";

// -----------------------------
// Variables du jeu
// -----------------------------
let score = 0;
let combo = 0;
let correctChars = 0;
let totalChars = 0;
let started = false;
let finished = false;

// -----------------------------
// Utilitaires
// -----------------------------
function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

function showGame() {
    if (gamePanel) {
        gamePanel.classList.remove("hidden");
    }

    if (endPanel) {
        endPanel.classList.add("hidden");
    }
}

function showEnd() {
    if (gamePanel) {
        gamePanel.classList.add("hidden");
    }

    if (endPanel) {
        endPanel.classList.remove("hidden");
    }

    setText(finalScoreEl, score);
}

function updateStats() {
    setText(scoreEl, score);
    
    const accuracy =
        totalChars === 0
            ? 100
            : Math.round((correctChars / totalChars) * 100);

    setText(accuracyEl, accuracy + "%");
}

function updateProgress() {
    if (!bar) return;

    const length = TEST_TEXT.length;
    const typed = input ? input.value.length : 0;

    const percent = Math.min(
        100,
        Math.round((typed / length) * 100)
    );

    bar.style.width = percent + "%";
}

// -----------------------------
// Faire avancer la vidéo
// -----------------------------
function advanceVideo(percent) {
    if (!video) return;

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
    }

    const targetTime =
        video.duration * Math.max(0, Math.min(1, percent));

    try {
        video.currentTime = targetTime;
    } catch (error) {
        console.warn("Impossible de déplacer la vidéo :", error);
    }
}

// -----------------------------
// Démarrage
// -----------------------------
function startGame() {
    score = 0;
    combo = 0;
    correctChars = 0;
    totalChars = 0;
    started = true;
    finished = false;

    showGame();

    setText(phrase, TEST_TEXT);
    setText(status, "Tape la phrase pour faire avancer la scène.");

    if (input) {
        input.value = "";
        input.disabled = false;
        input.focus();
    }

    if (video) {
        video.pause();
        video.currentTime = 0;

        // On vérifie que la vidéo existe.
        video.load();
    }

    if (bar) {
        bar.style.width = "0%";
    }

    updateStats();
}

// -----------------------------
// Vérification de la frappe
// -----------------------------
function handleTyping() {
    if (!started || finished || !input) {
        return;
    }

    const typed = input.value;

    // Nombre de caractères réellement tapés
    totalChars = typed.length;

    // Vérification caractère par caractère
    let correct = true;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] !== TEST_TEXT[i]) {
            correct = false;
            break;
        }
    }

    // -------------------------
    // Erreur
    // -------------------------
    if (!correct) {
        combo = 0;

        setText(
            status,
            "❌ Erreur — la vidéo ne progresse pas."
        );

        updateStats();

        // On remet la frappe au dernier caractère correct.
        let validLength = 0;

        while (
            validLength < typed.length &&
            typed[validLength] === TEST_TEXT[validLength]
        ) {
            validLength++;
        }

        input.value = typed.substring(0, validLength);

        updateProgress();

        return;
    }

    // -------------------------
    // Caractère correct
    // -------------------------
    correctChars = typed.length;
    combo++;

    score += 10 + combo;

    setText(
        status,
        "✅ Correct — la scène avance !"
    );

    updateStats();
    updateProgress();

    // Progression proportionnelle de la vidéo
    const percent = typed.length / TEST_TEXT.length;

    advanceVideo(percent);

    // -------------------------
    // Phrase terminée
    // -------------------------
    if (typed === TEST_TEXT) {
        finishGame();
    }
}

// -----------------------------
// Fin de la scène
// -----------------------------
function finishGame() {
    if (finished) return;

    finished = true;

    if (input) {
        input.disabled = true;
    }

    if (bar) {
        bar.style.width = "100%";
    }

    if (video && Number.isFinite(video.duration)) {
        video.currentTime = video.duration;
    }

    setText(
        status,
        "🎬 Scène terminée !"
    );

    setText(finalScoreEl, score);

    setTimeout(() => {
        showEnd();
    }, 800);
}

// -----------------------------
// Bouton Lancer le test
// -----------------------------
if (startBtn) {
    startBtn.addEventListener("click", startGame);
}

// -----------------------------
// Bouton Recommencer
// -----------------------------
if (againBtn) {
    againBtn.addEventListener("click", startGame);
}

// -----------------------------
// Frappe clavier
// -----------------------------
if (input) {
    input.addEventListener("input", handleTyping);
}

// -----------------------------
// Chargement vidéo
// -----------------------------
if (video) {
    video.addEventListener("loadedmetadata", () => {
        console.log(
            "Vidéo chargée :",
            video.duration,
            "secondes"
        );
    });

    video.addEventListener("error", () => {
        console.error(
            "Impossible de charger la vidéo :",
            TEST_VIDEO
        );

        setText(
            status,
            "⚠️ Impossible de charger scene01.mp4."
        );
    });
}

// -----------------------------
// Initialisation
// -----------------------------
console.log("🎬 Movie Typing V3 chargé.");

if (phrase) {
    phrase.textContent = "Appuie sur « Lancer le test ».";
}
