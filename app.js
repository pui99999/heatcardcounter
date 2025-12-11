const INITIAL_DECK = {
    '1': 3,
    '2': 3,
    '3': 3,
    '4': 3,
    'stress': 3,
    'd1': 1,
    'd2': 1,
    'd3': 1
};

const STORAGE_KEY = 'heat-card-counter';
const NAMES_STORAGE_KEY = 'heat-card-names';
const HEAT_STORAGE_KEY = 'heat-card-heat';

let deck = {};
let cardNames = { d1: '', d2: '', d3: '' };
let heatCount = 0;

function loadDeck() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        deck = JSON.parse(saved);
    } else {
        deck = { ...INITIAL_DECK };
    }
}

function saveDeck() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
}

function loadCardNames() {
    const saved = localStorage.getItem(NAMES_STORAGE_KEY);
    if (saved) {
        cardNames = JSON.parse(saved);
    }
}

function saveCardNames() {
    localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(cardNames));
}

function updateCardNameInputs() {
    document.querySelectorAll('.card-name-input').forEach(input => {
        const key = input.dataset.name;
        input.value = cardNames[key] || '';
    });
}

function loadHeatCount() {
    const saved = localStorage.getItem(HEAT_STORAGE_KEY);
    if (saved) {
        heatCount = parseInt(saved, 10);
    } else {
        heatCount = 0;
    }
}

function saveHeatCount() {
    localStorage.setItem(HEAT_STORAGE_KEY, heatCount.toString());
}

function updateHeatDisplay() {
    const row = document.querySelector('[data-card="heat"]');
    const remainingSpan = row.querySelector('.remaining');
    const minusBtn = row.querySelector('.btn-minus');

    remainingSpan.textContent = heatCount;
    minusBtn.disabled = heatCount <= 0;
}

function updateDisplay() {
    let total = 0;

    for (const [card, max] of Object.entries(INITIAL_DECK)) {
        const remaining = deck[card];
        total += remaining;
    }

    total += heatCount;

    for (const [card, max] of Object.entries(INITIAL_DECK)) {
        const remaining = deck[card];

        const row = document.querySelector(`[data-card="${card}"]`);
        const remainingSpan = row.querySelector('.remaining');
        const probValue = row.querySelector('.prob-value');
        const minusBtn = row.querySelector('.btn-minus');
        const plusBtn = row.querySelector('.btn-plus');

        remainingSpan.textContent = remaining;

        // 確率計算
        const prob = total > 0 ? (remaining / total * 100) : 0;
        probValue.textContent = prob.toFixed(1);

        if (remaining === 0) {
            row.classList.add('empty');
            minusBtn.disabled = true;
        } else {
            row.classList.remove('empty');
            minusBtn.disabled = false;
        }

        // stressカードは上限なし、それ以外は初期値が上限
        plusBtn.disabled = card !== 'stress' && remaining >= max;
    }

    // ヒートカードの確率も更新
    const heatRow = document.querySelector('[data-card="heat"]');
    const heatProbValue = heatRow.querySelector('.prob-value');
    const heatProb = total > 0 ? (heatCount / total * 100) : 0;
    heatProbValue.textContent = heatProb.toFixed(1);

    document.getElementById('total-count').textContent = total;
}

function decrementCard(card) {
    if (deck[card] > 0) {
        deck[card]--;
        saveDeck();
        updateDisplay();
    }
}

function incrementCard(card) {
    const max = INITIAL_DECK[card];
    if (deck[card] < max) {
        deck[card]++;
        saveDeck();
        updateDisplay();
    }
}

function resetDeck() {
    if (confirm('デッキをリセットしますか？')) {
        deck = { ...INITIAL_DECK };
        heatCount = 0;
        saveDeck();
        saveHeatCount();
        updateDisplay();
        updateHeatDisplay();
    }
}

function init() {
    loadDeck();
    loadCardNames();
    loadHeatCount();
    updateDisplay();
    updateCardNameInputs();
    updateHeatDisplay();

    document.querySelectorAll('.card-row:not(.heat)').forEach(row => {
        const card = row.dataset.card;

        row.querySelector('.btn-minus').addEventListener('click', () => {
            decrementCard(card);
        });

        row.querySelector('.btn-plus').addEventListener('click', () => {
            incrementCard(card);
        });
    });

    // ヒートカードのイベントリスナー
    const heatRow = document.querySelector('[data-card="heat"]');
    heatRow.querySelector('.btn-minus').addEventListener('click', () => {
        if (heatCount > 0) {
            heatCount--;
            saveHeatCount();
            updateHeatDisplay();
            updateDisplay();
        }
    });
    heatRow.querySelector('.btn-plus').addEventListener('click', () => {
        heatCount++;
        saveHeatCount();
        updateHeatDisplay();
        updateDisplay();
    });

    document.querySelectorAll('.card-name-input').forEach(input => {
        input.addEventListener('input', () => {
            const key = input.dataset.name;
            cardNames[key] = input.value;
            saveCardNames();
        });
    });

    document.getElementById('reset-btn').addEventListener('click', resetDeck);
}

document.addEventListener('DOMContentLoaded', init);
