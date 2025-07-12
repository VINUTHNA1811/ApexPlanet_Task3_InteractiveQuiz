const startBtn = document.getElementById("startBtn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const questionCount = document.getElementById("questionCount");
const countLabel = document.getElementById("countLabel");
const quizContainer = document.getElementById("quizContainer");
const questionBox = document.getElementById("questionBox");
const optionsBox = document.getElementById("optionsBox");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const finishBtn = document.getElementById("finishBtn");
const progressBar = document.getElementById("progressBar");
const scoreBadge = document.getElementById("scoreBadge");
const resultScreen = document.getElementById("resultScreen");
const resultText = document.getElementById("resultText");
const loader = document.getElementById("loader");
const confettiCanvas = document.getElementById("confettiCanvas");
const darkModeToggle = document.getElementById("darkModeToggle");
const setupCard = document.getElementById("setupCard");
const jokeBtn = document.getElementById("jokeBtn");
const jokeDisplay = document.getElementById("jokeDisplay");
const jokeSection = document.getElementById("jokeSection");
const homeBtn = document.getElementById("homeBtn");

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let userAnswers = [];

countLabel.textContent = questionCount.value;
questionCount.addEventListener("input", () => {
  countLabel.textContent = questionCount.value;
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  loader.classList.remove("hidden");
  setupCard.classList.add("hidden");
  quizContainer.classList.add("hidden");
  resultScreen.classList.add("hidden");
  jokeSection.classList.add("hidden");

  questions = await fetchQuestions();
  score = 0;
  userAnswers = Array(questions.length).fill(null);
  currentQuestionIndex = 0;
  loader.classList.add("hidden");

  if (questions.length > 0) {
    quizContainer.classList.remove("hidden");
    displayQuestion();
  } else {
    alert("Failed to load questions. Please try again.");
    setupCard.classList.remove("hidden");
    jokeSection.classList.remove("hidden");
  }
  startBtn.disabled = false;
});

async function fetchQuestions() {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const amount = questionCount.value;
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results.map(q => {
      const answers = [...q.incorrect_answers];
      const idx = Math.floor(Math.random() * 4);
      answers.splice(idx, 0, q.correct_answer);
      return {
        question: decodeHTML(q.question),
        answers: answers.map(decodeHTML),
        correctAnswer: decodeHTML(q.correct_answer)
      };
    });
  } catch {
    return [];
  }
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function displayQuestion() {
  const q = questions[currentQuestionIndex];
  questionBox.textContent = `Q${currentQuestionIndex + 1}: ${q.question}`;
  optionsBox.innerHTML = "";
  q.answers.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option-btn");
    if (userAnswers[currentQuestionIndex] !== null) {
      btn.disabled = true;
      const sel = userAnswers[currentQuestionIndex];
      if (option === q.correctAnswer) btn.classList.add("correct");
      else if (option === sel) btn.classList.add("wrong");
    }
    btn.addEventListener("click", () => handleAnswer(option, btn));
    optionsBox.appendChild(btn);
  });
  updateProgress();
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.classList.toggle("hidden", currentQuestionIndex === questions.length - 1);
  finishBtn.classList.toggle("hidden", currentQuestionIndex !== questions.length - 1);
}

function handleAnswer(answer, btn) {
  if (userAnswers[currentQuestionIndex] !== null) return;
  userAnswers[currentQuestionIndex] = answer;
  const correct = questions[currentQuestionIndex].correctAnswer;
  if (answer === correct) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    [...optionsBox.children].forEach(b => {
      if (b.textContent === correct) b.classList.add("correct");
    });
  }
  [...optionsBox.children].forEach(b => b.disabled = true);
  scoreBadge.textContent = `Score: ${score}`;
}

function updateProgress() {
  const pct = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${pct}%`;
}

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
});

finishBtn.addEventListener("click", () => {
  if (userAnswers.every(a => a !== null)) showResult();
  else alert("Please answer all questions before finishing.");
});

homeBtn.addEventListener("click", () => {
  confettiCanvas.classList.add("hidden");
  resultScreen.classList.add("hidden");
  setupCard.classList.remove("hidden");
  jokeSection.classList.remove("hidden");
});

function showResult() {
  quizContainer.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  resultText.textContent = `You got ${score} out of ${questions.length} correct!`;
  launchConfetti();
}

function launchConfetti() {
  confettiCanvas.classList.remove("hidden");
  const end = Date.now() + 3000;
  (function frame() {
    confetti({particleCount:2,angle:60,spread:55,origin:{x:0},colors:['#bb0000','#ffffff','#3333ff','#222222']});
    confetti({particleCount:2,angle:120,spread:55,origin:{x:1},colors:['#bb0000','#ffffff','#3333ff','#222222']});
    if (Date.now() < end) requestAnimationFrame(frame);
    else setTimeout(() => confettiCanvas.classList.add("hidden"),1000);
  })();
}

jokeBtn.addEventListener("click", async () => {
  jokeDisplay.textContent = "Loading a joke...";
  try {
    const res = await fetch("https://icanhazdadjoke.com/",{headers:{Accept:"application/json"}});
    const {joke} = await res.json();
    jokeDisplay.textContent = joke;
  } catch {
    jokeDisplay.textContent = "Oops! Couldn't fetch a joke. Try again!";
  }
});