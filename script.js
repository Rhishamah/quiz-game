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
const STORAGE_KEY_CATEGORY = 'quizCategory';
const STORAGE_KEY_QUESTIONS = 'quizQuestions';

// Default questions
const DEFAULT_QUESTIONS = [
    {
        question: "what is the capital of france ?",
        category: "Geography",
        answers: [
            { text: "London", correct: false },
            { text: "Berlin", correct: false },
            { text: "Paris", correct: true },
            { text: "Madrid", correct: false },
        ],
    },
    {
        question: "Which planet is known as the red planet?",
        category: "Science",
        answers: [
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Saturn", correct: false },
            { text: "Neptune", correct: false },
        ],
    },
    {
        question: "What is the name of the largest ocean on Earth ?",
        category: "Geography",
        answers: [
            { text: "Pacific ocean", correct: true },
            { text: "Atlantic ocean", correct: false },
            { text: "Indian ocean", correct: false },
            { text: "Arctic ocean", correct: false },
        ],
    },
    {
        question: "Which programming language is the easiest to learn ?",
        category: "Programming",
        answers: [
            { text: "C++", correct: false },
            { text: "Javascript", correct: false },
            { text: "Python", correct: true },
            { text: "C", correct: false },
        ],
    },
];

// Load questions from localStorage if available, otherwise use defaults
const quizQuestions = JSON.parse(localStorage.getItem(STORAGE_KEY_QUESTIONS)) || DEFAULT_QUESTIONS;

let filteredQuestions = [];
//quiz state vars
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

// populate category options and initialize counts
populateCategoryOptions();

//event listeners
startButton.addEventListener("click", startQuiz);
if (categorySelect) {
    categorySelect.addEventListener("change", () => {
        try {
            localStorage.setItem(STORAGE_KEY_CATEGORY, categorySelect.value);
        } catch (e) {
            // ignore storage errors
        }
        updateCategoryCount();
    });
}
restartButton.addEventListener("click", restartQuiz);

function startQuiz() {
    // reset vars
    currentQuestionIndex = 0;
    score = 0;
    scoreSpan.textContent = 0;
    startScreen.classList.remove("active");
    quizScreen.classList.add("active");

    // determine selected category and build filtered questions
    const selected = categorySelect ? categorySelect.value : "all";
    if (selected === "all") {
        filteredQuestions = [...quizQuestions];
    } else {
        filteredQuestions = quizQuestions.filter(q => q.category === selected);
    }

    if (filteredQuestions.length === 0) {
        alert("No questions available for the selected category.");
        // return to start screen
        quizScreen.classList.remove("active");
        startScreen.classList.add("active");
        return;
    }

    totalQuestionsSpan.textContent = filteredQuestions.length;
    maxScoreSpan.textContent = filteredQuestions.length;

    showQuestion();
}
function showQuestion() {
    // reset state
    answersDisabled = false;
    const currentQuestion = filteredQuestions[currentQuestionIndex];

    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    const progressPercent = (currentQuestionIndex / filteredQuestions.length) * 100;
    progressBar.style.width = progressPercent + "%";
    //questions
    questionText.textContent = currentQuestion.question;

    //answer container
    answersContainer.innerHTML = "";

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("answer-btn");
        //datasets allow you to store custom data
        button.dataset.correct = answer.correct;
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
    Array.from(answersContainer.children).forEach(button => {
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
function showResults() {
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    finalScoreSpan.textContent = score;

    const percentage = (score / filteredQuestions.length) * 100;

    if (percentage === 100) {
        resultMessage.textContent = "Great job! You're a genius";
    } else if (percentage >= 80) {
        resultMessage.textContent = "Great job! You know your stuff!";
    }
    else if (percentage >= 60) {
        resultMessage.textContent = "Good effort! keep learning!";
    }
    else if (percentage >= 40) {
        resultMessage.textContent = "Not bad! Try again to improve!";
    }
    else {
        resultMessage.textContent = "Keep studying! you'll get better!";
    }
}
function restartQuiz() {
    resultScreen.classList.remove("active");

    startQuiz();
}

function populateCategoryOptions() {
    if (!categorySelect) return;
    const categories = Array.from(new Set(quizQuestions.map(q => q.category))).sort();
    // remove existing non-'all' options
    const total = quizQuestions.length;
    categorySelect.innerHTML = `<option value="all">All Categories (${total})</option>`;
    categories.forEach(cat => {
        const count = quizQuestions.filter(q => q.category === cat).length;
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${cat} (${count})`;
        categorySelect.appendChild(opt);
    });
    // restore previously selected category if present
    try {
        const saved = localStorage.getItem(STORAGE_KEY_CATEGORY);
        if (saved) {
            const optionExists = Array.from(categorySelect.options).some(o => o.value === saved);
            if (optionExists) categorySelect.value = saved;
        }
    } catch (e) {
        // ignore storage errors
    }

    updateCategoryCount();
}

function updateCategoryCount() {
    if (!categorySelect) return;
    const selected = categorySelect.value;
    const count = selected === 'all' ? quizQuestions.length : quizQuestions.filter(q => q.category === selected).length;
    totalQuestionsSpan.textContent = count;
    maxScoreSpan.textContent = count;
    // disable start if no questions
    startButton.disabled = count === 0;
}
