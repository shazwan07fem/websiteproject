// Web Audio Synthesizer sound generator
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'pour') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'ice') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.setValueAtTime(400, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'shake') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.setValueAtTime(220, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.15);
            osc.frequency.setValueAtTime(783.99, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'fail') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch(e) {}
}

// Available Drink Recipes Database
const MENU_RECIPES = [
    {
        id: 'sirap_bandung',
        name: 'Sirap Bandung Ais',
        required: ['sirap_ros', 'susu_pekat'],
        hasIce: true,
        garnishes: [],
        isShaken: false,
        price: 8.50,
        desc: '"Tolong buatkan saya Sirap Bandung Ais segar!"'
    },
    {
        id: 'bandung_soda',
        name: 'Sirap Bandung Soda',
        required: ['sirap_ros', 'susu_pekat', 'soda'],
        hasIce: true,
        garnishes: [],
        isShaken: true,
        price: 10.00,
        desc: '"Saya nak Sirap Bandung Soda bergas yang digoncang sejuk!"'
    },
    {
        id: 'epal_mint_soda',
        name: 'Epal Mint Soda',
        required: ['jus_epal', 'soda'],
        hasIce: true,
        garnishes: ['pudina'],
        isShaken: false,
        price: 11.50,
        desc: '"Boleh sediakan Epal Mint Soda dengan ais dan daun pudina?"'
    },
    {
        id: 'mangga_tropika',
        name: 'Mangga Tropika Twist',
        required: ['sirap_mangga', 'jus_oren'],
        hasIce: true,
        garnishes: ['lemon'],
        isShaken: true,
        price: 12.00,
        desc: '"Saya inginkan minuman Mangga Tropika Twist digoncang dengan hirisan lemon!"'
    },
    {
        id: 'citrus_berry',
        name: 'Citrus Cherry Delight',
        required: ['jus_oren', 'soda'],
        hasIce: true,
        garnishes: ['ceri', 'lemon'],
        isShaken: false,
        price: 13.00,
        desc: '"Boleh buatkan Jus Oren Soda berteman Hiasan Ceri & Lemon?"'
    }
];

const CUSTOMER_AVATARS = ['🧑‍🦱', '👩‍🦰', '🧔‍♂️', '👵', '👨‍🍳', '👩‍💼'];
const CUSTOMER_NAMES = ['Abang Ali', 'Kak Maria', 'En. Tan', 'Puan Lee', 'Musa', 'Siti'];

// Game State
let totalMoney = 0.00;
let totalScore = 0;
let currentCustomerIndex = 0;
let currentOrder = null;
let patienceTimer = null;
let patiencePercent = 100;

// Current Glass State
let currentGlass = {
    liquids: [], // { id, name, color }
    hasIce: false,
    garnishes: [], // ['lemon', 'pudina', 'ceri']
    isShaken: false
};

// DOM Elements
const glassContainer = document.getElementById('glass-container');
const liquidStack = document.getElementById('liquid-stack');
const iceLayer = document.getElementById('ice-layer');
const garnishLayer = document.getElementById('garnish-layer');
const ingredientsSummary = document.getElementById('ingredients-summary');

// Initialize Game
function initGame() {
    setupEventListeners();
    loadNextCustomer();
}

function loadNextCustomer() {
    resetGlass();
    
    // Pick random customer avatar & order recipe
    const avatar = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    currentOrder = MENU_RECIPES[Math.floor(Math.random() * MENU_RECIPES.length)];

    document.getElementById('customer-avatar').innerText = avatar;
    document.getElementById('customer-name').innerText = `${name} (Pelanggan #${++currentCustomerIndex})`;
    document.getElementById('order-text').innerText = currentOrder.desc;

    // Reset Patience Timer
    patiencePercent = 100;
    updatePatienceUI();

    clearInterval(patienceTimer);
    patienceTimer = setInterval(() => {
        patiencePercent -= 2;
        updatePatienceUI();

        if (patiencePercent <= 0) {
            clearInterval(patienceTimer);
            handleCustomerLeave();
        }
    }, 1000);

    // Update recipe hint modal
    updateRecipeHintModal();
}

function updatePatienceUI() {
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    const mood = document.getElementById('customer-mood');

    timerBar.style.width = `${patiencePercent}%`;
    timerText.innerText = `${patiencePercent}%`;

    if (patiencePercent > 60) {
        timerBar.className = 'bg-emerald-500 h-full w-full transition-all duration-300';
        mood.innerText = 'Gembira';
        mood.className = 'absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold shadow-md';
    } else if (patiencePercent > 30) {
        timerBar.className = 'bg-amber-500 h-full w-full transition-all duration-300';
        mood.innerText = 'Resah';
        mood.className = 'absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold shadow-md';
    } else {
        timerBar.className = 'bg-rose-500 h-full w-full transition-all duration-300';
        mood.innerText = 'Marah!';
        mood.className = 'absolute -bottom-1 -right-1 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md animate-pulse';
    }
}

function updateRecipeHintModal() {
    document.getElementById('recipe-name-display').innerText = currentOrder.name;
    const list = document.getElementById('recipe-ingredients-list');
    list.innerHTML = '';

    currentOrder.required.forEach(reqId => {
        const li = document.createElement('li');
        li.innerText = reqId.replace('_', ' ').toUpperCase();
        list.appendChild(li);
    });

    if (currentOrder.hasIce) {
        const li = document.createElement('li');
        li.innerText = 'AIS KETUL';
        list.appendChild(li);
    }

    if (currentOrder.garnishes.length > 0) {
        const li = document.createElement('li');
        li.innerText = 'HIASAN: ' + currentOrder.garnishes.join(', ').toUpperCase();
        list.appendChild(li);
    }

    if (currentOrder.isShaken) {
        const li = document.createElement('li');
        li.innerText = 'PERLU DIGONCANG (SHAKE)';
        list.appendChild(li);
    }
}

function addLiquid(id, name, color) {
    if (currentGlass.liquids.length >= 4) {
        alert('Gelas sudah penuh!');
        return;
    }

    playSound('pour');
    currentGlass.liquids.push({ id, name, color });
    renderGlassUI();
}

function toggleIce() {
    playSound('ice');
    currentGlass.hasIce = !currentGlass.hasIce;
    renderGlassUI();
}

function addGarnish(type) {
    if (currentGlass.garnishes.includes(type)) return;
    playSound('pour');
    currentGlass.garnishes.push(type);
    renderGlassUI();
}

function shakeGlass() {
    if (currentGlass.liquids.length === 0) return;

    playSound('shake');
    glassContainer.classList.add('animate-shake');
    
    setTimeout(() => {
        glassContainer.classList.remove('animate-shake');
        currentGlass.isShaken = true;
        renderGlassUI();
    }, 600);
}

function resetGlass() {
    currentGlass = {
        liquids: [],
        hasIce: false,
        garnishes: [],
        isShaken: false
    };
    renderGlassUI();
}

function renderGlassUI() {
    // Render Liquids
    liquidStack.innerHTML = '';
    const totalLiquids = currentGlass.liquids.length;

    if (totalLiquids > 0) {
        const heightPercent = 100 / Math.max(totalLiquids, 1);
        currentGlass.liquids.forEach(liq => {
            const layer = document.createElement('div');
            layer.className = 'liquid-layer w-full';
            layer.style.height = `${heightPercent}%`;
            layer.style.backgroundColor = liq.color;
            if (currentGlass.isShaken) {
                layer.style.opacity = '0.85';
            }
            liquidStack.appendChild(layer);
        });
        liquidStack.style.height = `${totalLiquids * 22}%`;
    } else {
        liquidStack.style.height = '0%';
    }

    // Render Ice
    if (currentGlass.hasIce) {
        iceLayer.classList.remove('hidden');
    } else {
        iceLayer.classList.add('hidden');
    }

    // Render Garnishes
    garnishLayer.innerHTML = '';
    currentGlass.garnishes.forEach(g => {
        const icon = document.createElement('span');
        icon.className = 'text-xl drop-shadow-md';
        if (g === 'lemon') icon.innerText = '🍋';
        else if (g === 'pudina') icon.innerText = '🌿';
        else if (g === 'ceri') icon.innerText = '🍒';
        garnishLayer.appendChild(icon);
    });

    // Summary text
    const liquidNames = currentGlass.liquids.map(l => l.name);
    let summaryStr = liquidNames.join(' + ');
    if (currentGlass.hasIce) summaryStr += ' + Ais';
    if (currentGlass.garnishes.length > 0) summaryStr += ' + ' + currentGlass.garnishes.join(', ');
    if (currentGlass.isShaken) summaryStr += ' [Digoncang]';

    ingredientsSummary.innerText = summaryStr || 'Kosong - Sila pilih ramuan.';
}

function serveDrink() {
    clearInterval(patienceTimer);

    // Validate player's drink against current order
    const playerLiquids = currentGlass.liquids.map(l => l.id).sort();
    const requiredLiquids = [...currentOrder.required].sort();

    const liquidsMatch = JSON.stringify(playerLiquids) === JSON.stringify(requiredLiquids);
    const iceMatch = currentGlass.hasIce === currentOrder.hasIce;
    const shakenMatch = currentGlass.isShaken === currentOrder.isShaken;

    // Check garnishes
    const garnishesMatch = currentOrder.garnishes.every(g => currentGlass.garnishes.includes(g));

    const isSuccess = liquidsMatch && iceMatch && shakenMatch && garnishesMatch;

    if (isSuccess) {
        playSound('success');
        // Calculate tip based on patience
        const tipBonus = (patiencePercent / 100) * 3.00;
        const earnedMoney = currentOrder.price + tipBonus;
        const earnedScore = Math.round(100 * (patiencePercent / 100)) + 50;

        totalMoney += earnedMoney;
        totalScore += earnedScore;

        updateHeaderStats();
        showResultModal(true, earnedScore, earnedMoney, 'Minuman Sempurna!', 'Pelanggan amat berpuas hati dengan hidangan anda!');
        addOrderLog(currentOrder.name, earnedMoney, true);
    } else {
        playSound('fail');
        showResultModal(false, 0, 0, 'Resipi Salah!', 'Pelanggan kecewa kerana minuman tidak mengikut pesanan!');
        addOrderLog(currentOrder.name, 0, false);
    }
}

function handleCustomerLeave() {
    playSound('fail');
    showResultModal(false, 0, 0, 'Pelanggan Beralih Pergi!', 'Masa menunggu terlalu lama. Pelanggan telah beredar.');
    addOrderLog(currentOrder.name, 0, false);
}

function updateHeaderStats() {
    document.getElementById('stat-money').innerText = `RM ${totalMoney.toFixed(2)}`;
    document.getElementById('stat-score').innerText = totalScore;
}

function showResultModal(isSuccess, score, money, title, desc) {
    const overlay = document.getElementById('result-overlay');
    const icon = document.getElementById('result-icon');
    const titleEl = document.getElementById('result-title');
    const descEl = document.getElementById('result-desc');
    const scoreEl = document.getElementById('result-score');
    const moneyEl = document.getElementById('result-money');

    if (isSuccess) {
        icon.innerHTML = '🌟';
        icon.className = 'w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-5xl';
        titleEl.className = 'font-outfit text-2xl font-bold text-emerald-400';
    } else {
        icon.innerHTML = '💔';
        icon.className = 'w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-5xl';
        titleEl.className = 'font-outfit text-2xl font-bold text-rose-400';
    }

    titleEl.innerText = title;
    descEl.innerText = desc;
    scoreEl.innerText = `+${score}`;
    moneyEl.innerText = `+RM ${money.toFixed(2)}`;

    overlay.classList.remove('hidden');
}

function addOrderLog(recipeName, moneyEarned, success) {
    const history = document.getElementById('order-history');
    if (history.children[0] && history.children[0].classList.contains('italic')) {
        history.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = `p-2 rounded-xl border flex items-center justify-between ${
        success ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
    }`;
    item.innerHTML = `
        <div>
            <div class="font-bold">${recipeName}</div>
            <div class="text-[10px] opacity-75">${success ? 'Berjaya Dipersembahkan' : 'Gagal'}</div>
        </div>
        <div class="font-bold font-mono">+RM ${moneyEarned.toFixed(2)}</div>
    `;

    history.prepend(item);
}

function setupEventListeners() {
    // Ingredient Buttons
    document.querySelectorAll('.ingredient-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const color = btn.dataset.color;
            addLiquid(id, name, color);
        };
    });

    // Add Ice & Garnishes
    document.getElementById('btn-add-ice').onclick = toggleIce;
    document.getElementById('btn-add-lemon').onclick = () => addGarnish('lemon');
    document.getElementById('btn-add-mint').onclick = () => addGarnish('pudina');
    document.getElementById('btn-add-cherry').onclick = () => addGarnish('ceri');

    // Action Buttons
    document.getElementById('btn-shake').onclick = shakeGlass;
    document.getElementById('btn-reset').onclick = () => { playSound('pour'); resetGlass(); };
    document.getElementById('btn-serve').onclick = serveDrink;

    // Next Customer Button on Modal
    document.getElementById('btn-next-customer').onclick = () => {
        document.getElementById('result-overlay').classList.add('hidden');
        loadNextCustomer();
    };

    // Toggle Recipe Drawer
    document.getElementById('btn-toggle-recipe').onclick = () => {
        const modal = document.getElementById('recipe-modal');
        modal.classList.toggle('hidden');
    };
}

// Start Game on Page Load
window.onload = function() {
    initGame();
};