//dom elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

const categorySelect = document.getElementById("category-select");
const playerNameInput = document.getElementById("player-name");
const errorMessage = document.getElementById("error-message");
let filteredQuestions = [];
//quiz state vars
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

// populate category options from API
populateCategoryOptions();

//event listeners
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;
  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  const selected = categorySelect ? categorySelect.value : "all";
  filteredQuestions = await fetchQuestions(selected === "all" ? null : selected);

  if (filteredQuestions.length === 0) {
    errorMessage.textContent = "No questions available for the selected category.";
    quizScreen.classList.remove("active");
    startScreen.classList.add("active");
    return;
  }
  errorMessage.textContent = "";

  filteredQuestions = shuffleArray(filteredQuestions);
  totalQuestionsSpan.textContent = filteredQuestions.length;
  maxScoreSpan.textContent = filteredQuestions.length;

  showQuestion();
}
function showQuestion() {
  // reset state
  answersDisabled = false;
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  const progressPercent =
    (currentQuestionIndex / filteredQuestions.length) * 100;
  progressBar.style.width = progressPercent + "%";
  //questions
  questionText.textContent = currentQuestion.text;

  //answer container
  answersContainer.innerHTML = "";

  // Shuffle answers for this question
  const shuffledAnswers = shuffleArray(currentQuestion.answers);

  shuffledAnswers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");
    //datasets allow you to store custom data
    button.dataset.correct = answer.is_correct;
    //for selecting the right answers ish
    button.addEventListener("click", selectAnswer);

    answersContainer.appendChild(button);
  });
}

function selectAnswer(event) {
  //optimization check
  if (answersDisabled) return;

  answersDisabled = true;

  //to get selected button
  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  //for progress bar feedback
  Array.from(answersContainer.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
  });
  //for  updating scores
  if (isCorrect) {
    score++;
    scoreSpan.textContent = score;
  }

  //pause between questions
  setTimeout(() => {
    currentQuestionIndex++;

    //checking for more questions or if the quiz is over
    if (currentQuestionIndex < filteredQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1000);
}
async function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  finalScoreSpan.textContent = score;

  const playerName = playerNameInput ? playerNameInput.value.trim() : "";
  if (playerName) {
    try {
      await submitScore(playerName, score, filteredQuestions.length);
    } catch (e) {
      // score submission failed silently
    }
  }

  const percentage = (score / filteredQuestions.length) * 100;

  if (percentage === 100) {
    resultMessage.textContent = "Great job! You're a genius";
  } else if (percentage >= 80) {
    resultMessage.textContent = "Great job! You know your stuff!";
  } else if (percentage >= 60) {
    resultMessage.textContent = "Good effort! keep learning!";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Not bad! Try again to improve!";
  } else {
    resultMessage.textContent = "Keep studying! you'll get better!";
  }
}
function restartQuiz() {
  resultScreen.classList.remove("active");

  startQuiz();
}

async function populateCategoryOptions() {
  if (!categorySelect) return;
  try {
    const questions = await fetchQuestions();
    const categories = [...new Set(questions.map((q) => q.category))].sort();
    categorySelect.innerHTML = `<option value="all">All Categories (${questions.length})</option>`;
    categories.forEach((cat) => {
      const count = questions.filter((q) => q.category === cat).length;
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = `${cat} (${count})`;
      categorySelect.appendChild(opt);
    });
  } catch (e) {
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
  }
}
