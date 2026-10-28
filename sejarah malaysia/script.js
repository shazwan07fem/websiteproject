// Wait for DOM content to load fully before executing scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Dark Mode Toggle ---
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Logo Scroll to Top ---
    const brandLogo = document.getElementById('brandLogo');
    if (brandLogo) {
        brandLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Quiz Data & Logic ---
    const quizData = [
        {
            question: "Siapakah pengasas bagi Kesultanan Melayu Melaka pada sekitar tahun 1400?",
            options: ["Hang Tuah", "Parameswara", "Sultan Muzaffar Shah", "Tun Perak"],
            answer: 1
        },
        {
            question: "Bilakah tarikh pengisytiharan Kemerdekaan Tanah Melayu?",
            options: ["16 September 1963", "31 Ogos 1957", "31 Ogos 1963", "13 Mei 1969"],
            answer: 1
        },
        {
            question: "Siapakah yang digelar sebagai 'Bapa Kemerdekaan' Malaysia?",
            options: ["Tun Abdul Razak", "Tun Hussein Onn", "Tunku Abdul Rahman", "Mat Kilau"],
            answer: 2
        },
        {
            question: "Slogan perjuangan 'Agi Idup, Agi Ngalaban' dikaitkan dengan pahlawan dari negeri mana?",
            options: ["Sabah", "Pahang", "Perak", "Sarawak"],
            answer: 3
        }
    ];

    let currentQuestion = 0;
    let score = 0;

    const questionNumberEl = document.getElementById('questionNumber');
    const questionTextEl = document.getElementById('questionText');
    const optionsContainerEl = document.getElementById('optionsContainer');
    const progressBarEl = document.getElementById('progressBar');
    const quizContentEl = document.getElementById('quizContent');
    const resultContentEl = document.getElementById('resultContent');
    const scoreTextEl = document.getElementById('scoreText');
    const restartBtn = document.getElementById('restartBtn');

    function loadQuestion() {
        if (!quizData[currentQuestion]) return;

        const current = quizData[currentQuestion];
        questionNumberEl.textContent = `Soalan ${currentQuestion + 1} daripada ${quizData.length}`;
        questionTextEl.textContent = current.question;
        progressBarEl.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;

        optionsContainerEl.innerHTML = '';
        current.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-900 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all font-medium text-slate-800 dark:text-slate-200 flex justify-between items-center";
            btn.innerHTML = `<span>${option}</span> <i class="fa-regular fa-circle text-slate-400"></i>`;
            btn.addEventListener('click', () => selectOption(index));
            optionsContainerEl.appendChild(btn);
        });
    }

    function selectOption(index) {
        if (index === quizData[currentQuestion].answer) {
            score++;
        }
        currentQuestion++;

        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        quizContentEl.classList.add('hidden');
        resultContentEl.classList.remove('hidden');
        scoreTextEl.textContent = `Anda telah menjawab ${score} daripada ${quizData.length} soalan dengan betul!`;
    }

    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        resultContentEl.classList.add('hidden');
        quizContentEl.classList.remove('hidden');
        loadQuestion();
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restartQuiz);
    }

    // Initialize quiz
    loadQuestion();
});