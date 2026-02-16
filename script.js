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
const STORAGE_KEY = 'quizCategory';

const quizQuestions = [
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
            localStorage.setItem(STORAGE_KEY, categorySelect.value);
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
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    // add options with per-category counts
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
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const optionExists = Array.from(categorySelect.options).some(o => o.value === saved);
            if (optionExists) categorySelect.value = saved;
        }
    } catch (e) {
        // ignore storage errors
    }

    // ensure option labels reflect current quizQuestions counts
    refreshCategoryOptionCounts();
    updateCategoryCount();
}

function refreshCategoryOptionCounts() {
    if (!categorySelect) return;
    const total = quizQuestions.length;
    Array.from(categorySelect.options).forEach(opt => {
        if (opt.value === 'all') {
            opt.textContent = `All Categories (${total})`;
        } else {
            const count = quizQuestions.filter(q => q.category === opt.value).length;
            opt.textContent = `${opt.value} (${count})`;
        }
    });
}

// expose for external updates when quizQuestions change dynamically
if (typeof window !== 'undefined') window.refreshCategoryOptionCounts = refreshCategoryOptionCounts;

function addQuestion(questionObj) {
    if (!questionObj || !questionObj.question) return false;
    quizQuestions.push(questionObj);
    populateCategoryOptions();
    try {
        // save current selection
        localStorage.setItem(STORAGE_KEY, categorySelect.value);
    } catch (e) { }
    return true;
}

function removeQuestion(index) {
    if (typeof index !== 'number') return false;
    if (index < 0 || index >= quizQuestions.length) return false;
    const removed = quizQuestions.splice(index, 1);
    populateCategoryOptions();
    // if saved category no longer exists, reset to 'all'
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const exists = Array.from(categorySelect.options).some(o => o.value === saved);
        if (!exists) {
            categorySelect.value = 'all';
            localStorage.setItem(STORAGE_KEY, 'all');
        }
    } catch (e) { }
    updateCategoryCount();
    return removed;
}

function removeQuestionsByCategory(cat) {
    if (!cat) return 0;
    let removed = 0;
    for (let i = quizQuestions.length - 1; i >= 0; i--) {
        if (quizQuestions[i].category === cat) {
            quizQuestions.splice(i, 1);
            removed++;
        }
    }
    if (removed) {
        populateCategoryOptions();
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const exists = Array.from(categorySelect.options).some(o => o.value === saved);
            if (!exists) {
                categorySelect.value = 'all';
                localStorage.setItem(STORAGE_KEY, 'all');
            }
        } catch (e) { }
        updateCategoryCount();
    }
    return removed;
}

// expose mutators for external UI code
if (typeof window !== 'undefined') {
    window.addQuestion = addQuestion;
    window.removeQuestion = removeQuestion;
    window.removeQuestionsByCategory = removeQuestionsByCategory;
}

// Admin UI wiring
const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const adminQuestion = document.getElementById('admin-question');
const adminCategory = document.getElementById('admin-category');
const adminAns = [
    document.getElementById('admin-ans-0'),
    document.getElementById('admin-ans-1'),
    document.getElementById('admin-ans-2'),
    document.getElementById('admin-ans-3')
];
const addQuestionBtn = document.getElementById('add-question-btn');
const questionList = document.getElementById('question-list');
const removeByCategoryInput = document.getElementById('admin-remove-category');
const removeByCategoryBtn = document.getElementById('remove-by-category-btn');

if (adminToggle && adminPanel) {
    adminToggle.addEventListener('click', () => {
        const shown = !adminPanel.hidden;
        adminPanel.hidden = shown;
        adminToggle.textContent = shown ? 'Show Admin' : 'Hide Admin';
    });
}

function renderQuestionList() {
    if (!questionList) return;
    questionList.innerHTML = '';
    quizQuestions.forEach((q, i) => {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.textContent = `${i}: ${q.question} [${q.category}]`;
        const btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.addEventListener('click', () => {
            removeQuestion(i);
            renderQuestionList();
        });
        li.appendChild(text);
        li.appendChild(btn);
        questionList.appendChild(li);
    });
}

if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', () => {
        const qText = adminQuestion.value && adminQuestion.value.trim();
        const cat = adminCategory.value && adminCategory.value.trim() || 'Uncategorized';
        if (!qText) {
            alert('Please enter a question');
            return;
        }
        const answers = adminAns.map((el, idx) => ({ text: el.value || '', correct: false }));
        const correctRadio = document.querySelector('input[name="admin-correct"]:checked');
        const correctIndex = correctRadio ? Number(correctRadio.value) : 0;
        if (!answers.some(a => a.text.trim())) {
            alert('Please provide at least one answer');
            return;
        }
        answers.forEach(a => a.text = a.text.trim());
        if (answers[correctIndex] && answers[correctIndex].text) answers[correctIndex].correct = true;
        const questionObj = { question: qText, category: cat, answers };
        const ok = addQuestion(questionObj);
        if (ok) {
            adminQuestion.value = '';
            adminCategory.value = '';
            adminAns.forEach(a => a.value = '');
            renderQuestionList();
            // set select to new category
            try { categorySelect.value = cat; localStorage.setItem(STORAGE_KEY, cat); } catch (e) { }
            updateCategoryCount();
            refreshCategoryOptionCounts();
            alert('Question added');
        } else {
            alert('Failed to add question');
        }
    });
}

if (removeByCategoryBtn) {
    removeByCategoryBtn.addEventListener('click', () => {
        const cat = removeByCategoryInput.value && removeByCategoryInput.value.trim();
        if (!cat) {
            alert('Enter a category to remove');
            return;
        }
        const removed = removeQuestionsByCategory(cat);
        renderQuestionList();
        refreshCategoryOptionCounts();
        updateCategoryCount();
        alert(`Removed ${removed} question(s) from category "${cat}"`);
    });
}

// initial render of question list
renderQuestionList();

function updateCategoryCount() {
    if (!categorySelect) return;
    const selected = categorySelect.value;
    const count = selected === 'all' ? quizQuestions.length : quizQuestions.filter(q => q.category === selected).length;
    totalQuestionsSpan.textContent = count;
    maxScoreSpan.textContent = count;
    // disable start if no questions
    startButton.disabled = count === 0;
}
