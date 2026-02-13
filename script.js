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


const quizQuestions = [
    {
        question: "what is the capital of france ?",
        answers: [
            { text: "London", correct: false },
            { text: "Berlin", correct: false },
            { text: "Paris", correct: true },
            { text: "Madrid", correct: false },
        ],
    },
    {
        question: "Which planet is known as the red planet?",
        answers: [

            { text: "mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Saturn", correct: false },
            { text: "Neptune", correct: false },
        ],
    },
    {
        question: "What is the name of the largest ocean on Earth ?",
        answers: [
            { text: "Atlantic ocean", correct: true },
            { text: "Indian ocean", correct: false },
            { text: "Arctic ocean", correct: false },
            { text: "Pacific ocean", correct: false },
        ],
    },
    {
        question: "Which programming language is the easiest to learn ?",
        answers: [
            { text: "C++", correct: false },
            { text: "Javascript", correct: false },
            { text: "Python", correct: true },
            { text: "C", correct: false },
        ],
    },
];
//quiz state vars
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

//event listeners
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz() {
    // reset vars
    console.log(Array.from(answersContainer.children).forEach((el) => console.log(el)));
    currentQuestionIndex = 0;
    scoreSpan.textContent = 0;
    startScreen.classList.remove("active");
    quizScreen.classList.add("active");

    showQuestion();
}
function showQuestion() {
    // reset state
    answersDisabled = false;
    const currentQuestion = quizQuestions[currentQuestionIndex];

    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
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
        if (currentQuestionIndex < quizQuestions.length) {
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

    const percentage = (score / quizQuestions.length) * 100;

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
