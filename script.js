// Защита: если Telegram WebApp недоступен — работаем без него
const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
    try {
        tg.setHeaderColor('#1a1b2e');
        tg.setBackgroundColor('#0f111a');
    } catch (e) {}
}

// =========================================================
// --- WAKE LOCK: не даём экрану гаснуть во время тренировки ---
// =========================================================
let wakeLock = null;
let fallbackVideo = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock активирован');
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock освобождён');
            });
        } else {
            enableVideoFallback();
        }
    } catch (err) {
        console.warn('Wake Lock ошибка:', err);
        enableVideoFallback();
    }
}

async function releaseWakeLock() {
    try {
        if (wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
        }
    } catch (e) {
        wakeLock = null;
    }
    disableVideoFallback();
}

// Фолбэк для старых WebView — скрытое зацикленное видео
function enableVideoFallback() {
    if (fallbackVideo) return;
    fallbackVideo = document.createElement('video');
    // Минимальный 1-секундный чёрный mp4 (data URI)
    fallbackVideo.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyA1YzY1NzA0IEguMjY0L2NvZGVjCkFWQyBsaWJhdmMgMTUzLjM1LjEwMAplbmNvZGVyPUxhdmY1OC4yMC4xMDAgY2JjPTAga2V5aW50PTI1IG1pbl9rZXlpbnQ9MjUgc2NlbmVjdXQ9NDAgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDEzMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MC4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRwPTIga2V5aW50X29wZW49MCB3ZWlnaHRiPTEgb3Blbl9nb3A9MA==';
    fallbackVideo.setAttribute('playsinline', '');
    fallbackVideo.setAttribute('webkit-playsinline', '');
    fallbackVideo.setAttribute('muted', '');
    fallbackVideo.setAttribute('loop', '');
    fallbackVideo.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(fallbackVideo);
    fallbackVideo.play().catch(() => {});
}

function disableVideoFallback() {
    if (fallbackVideo) {
        try { fallbackVideo.pause(); } catch (e) {}
        fallbackVideo.remove();
        fallbackVideo = null;
    }
}

// =========================================================
// Данные тренировки
// =========================================================
const workoutData = [
    { id: 1, title: "СУПЕРСЕТ 1 — Ноги + Плечи ", rest: 120, intraRest: 60, exercises: [
        { name: "Приседания с гантелями ", desc: "Гантели у плеч, спина прямая ", tag: "15 кг × 8–12 ", type: "base " },
        { name: "Жим гантелей стоя ", desc: "Нейтральный хват, ладони у ушей ", tag: "15 кг × 8–12 ", type: "base " }
    ]},
    { id: 2, title: "СУПЕРСЕТ 2 — Спина + Задние дельты ", rest: 120, intraRest: 60, exercises: [
        { name: "Тяга в наклоне к поясу ", desc: "Спина параллельна полу ", tag: "15 кг × 8–12 ", type: "base " },
        { name: "Разведение в наклоне ", desc: "Наклон 45°, буква «Т» ", tag: "9 кг × 10–12 ", type: "iso " }
    ]},
    { id: 3, title: "СУПЕРСЕТ 3 — Грудь + Трапеции ", rest: 120, note: "🔬 Антагонисты: жим + тяга ", exercises: [
        { name: "Жим гантелей лёжа ", desc: "Лопатки сведены ", tag: "15 кг × 8–12 ", type: "base " },
        { name: "Тяга к подбородку ", desc: "Локти выше кистей ", tag: "15 кг × 8–12 ", type: "base " }
    ]},
    { id: 4, title: "СУПЕРСЕТ 4 — Ноги + Бицепс ", rest: 120, intraRest: 60, exercises: [
        { name: "Выпады с гантелями ", desc: "Колено почти к полу ", tag: "9 кг × 10–12 ", type: "iso " },
        { name: "Сгибание рук стоя ", desc: "Негатив 3–4 сек ", tag: "9 кг × 10–12 ", type: "iso " }
    ]},
    { id: 5, title: "СУПЕРСЕТ 5 — Пресс + Икры ", rest: 120, intraRest: 60, exercises: [
        { name: "Скручивания с гантелью ", desc: "Поясница на месте ", tag: "9 кг × 12–15 ", type: "iso " },
        { name: "Подъёмы на носки ", desc: "Пауза 2 сек наверху ", tag: "15 кг × 12–15 ", type: "base " }
    ]},
    { id: 6, title: "СУПЕРСЕТ 6 — Трицепс + Трапеции ", rest: 120, intraRest: 60, exercises: [
        { name: "Французский жим ", desc: "Локти в потолок ", tag: "9 кг × 12 повт ", type: "iso " },
        { name: "Шраги с гантелями ", desc: "Плечи строго вверх ", tag: "15 кг × 12–15 ", type: "base " }
    ]}
];

let state = {
    isRunning: false, startTime: null, elapsedTime: 0, timerInterval: null,
    setsDone: 0, totalSets: workoutData.length * 3,
    completedSupersets: new Array(workoutData.length).fill(false),
    roundChecks: new Array(workoutData.length).fill(null).map(() => [false, false, false]),
    exerciseChecks: {},
    calendarDate: new Date()
};

const els = {
    totalTime: document.getElementById('total-time'),
    btnStart: document.getElementById('btn-start'),
    btnReset: document.getElementById('btn-reset'),
    setsDone: document.getElementById('sets-done'),
    progressPercent: document.getElementById('progress-percent'),
    supersetsContainer: document.getElementById('supersets-container'),
    restOverlay: document.getElementById('rest-overlay'),
    restTimer: document.getElementById('rest-timer'),
    restTitle: document.getElementById('rest-title'),
    restDesc: document.getElementById('rest-desc'),
    btnSkipRest: document.getElementById('btn-skip-rest'),
    completionScreen: document.getElementById('completion-screen'),
    finalStats: document.getElementById('final-stats'),
    btnMarkToday: document.getElementById('btn-mark-today'),
    totalWorkoutsEl: document.getElementById('total-workouts'),
    monthWorkoutsEl: document.getElementById('month-workouts'),
    bestTimeEl: document.getElementById('best-time'),
    calendarGrid: document.getElementById('calendar-grid'),
    currentMonthYear: document.getElementById('current-month-year'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month')
};

function init() {
    loadStats();
    renderSupersets();
    renderCalendar();
    updateStatsUI();

    els.btnStart.addEventListener('click', toggleTimer);
    els.btnReset.addEventListener('click', resetWorkout);
    els.btnSkipRest.addEventListener('click', skipRest);
    els.btnMarkToday.addEventListener('click', () => {
        markDay(new Date(), 'workout');
        els.completionScreen.classList.add('hidden');
        if (tg) tg.MainButton.hide();
    });
    els.prevMonth.addEventListener('click', () => {
        state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
        renderCalendar();
    });
    els.nextMonth.addEventListener('click', () => {
        state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
        renderCalendar();
    });

    if (tg) tg.MainButton.onClick(() => tg.close());

    // Переподключаем Wake Lock при возврате в WebView (после сворачивания)
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && state.isRunning) {
            await requestWakeLock();
        }
    });
}

// --- КАЛЕНДАРЬ ---
function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    els.currentMonthYear.textContent = state.calendarDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const calendarData = JSON.parse(localStorage.getItem('dw_calendar')) || {};

    els.calendarGrid.innerHTML = '';
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
        els.calendarGrid.innerHTML += `<div class="cal-day-label">${d}</div>`;
    });
    for (let i = 1; i < firstDay; i++) {
        els.calendarGrid.innerHTML += `<div class="cal-day empty"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${month}-${d}`;
        const status = calendarData[dateKey] || '';
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        const dayEl = document.createElement('div');
        dayEl.className = `cal-day ${status} ${isToday ? 'today' : ''}`;
        dayEl.textContent = d;

        let pressTimer;
        dayEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressTimer = setTimeout(() => {
                markDay(new Date(year, month, d), status === 'rest' ? '' : 'rest');
            }, 600);
        });
        dayEl.addEventListener('touchend', () => clearTimeout(pressTimer));
        dayEl.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => markDay(new Date(year, month, d), status === 'rest' ? '' : 'rest'), 600);
        });
        dayEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        dayEl.addEventListener('click', () => markDay(new Date(year, month, d), status === 'workout' ? '' : 'workout'));

        els.calendarGrid.appendChild(dayEl);
    }
}

function markDay(date, type) {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const data = JSON.parse(localStorage.getItem('dw_calendar')) || {};
    if (type === '') delete data[key];
    else data[key] = type;
    localStorage.setItem('dw_calendar', JSON.stringify(data));
    renderCalendar();
}

// --- ТРЕНИРОВКА ---
function renderSupersets() {
    els.supersetsContainer.innerHTML = '';
    workoutData.forEach((ss, ssIndex) => {
        const card = document.createElement('div');
        card.className = 'superset-card';
        let html = '';
        if (ss.note) html += `<div style="padding:15px; background:rgba(155,89,182,0.1); font-size:13px; color:#d2b4de; border-bottom:1px solid rgba(255,255,255,0.05);">${ss.note}</div>`;
        ss.exercises.forEach((ex, exIndex) => {
            const key = `${ssIndex}_${exIndex}`;
            state.exerciseChecks[key] = [false, false, false];
            html += `<div class="exercise-item">
                <div class="ex-name">${getIcon(ex.name)} ${ex.name}</div>
                <div class="ex-desc">${ex.desc}</div>
                <span class="ex-tag ${ex.type}">${ex.tag}</span>
                <div class="set-checks" id="checks-${key}">
                    <div class="set-check" onclick="toggleCheck(${ssIndex}, ${exIndex}, 0)">✓</div>
                    <div class="set-check" onclick="toggleCheck(${ssIndex}, ${exIndex}, 1)">✓</div>
                    <div class="set-check" onclick="toggleCheck(${ssIndex}, ${exIndex}, 2)">✓</div>
                    <div class="set-status" id="status-${key}">0/3</div>
                </div></div>`;
        });
        card.innerHTML = `<div class="superset-header"><h3> ${ss.title}</h3><div class="rest-badge">⏱ 1 мин / ${ss.rest/60} мин</div></div>${html}`;
        els.supersetsContainer.appendChild(card);
    });
}

function getIcon(name) {
    if (name.includes("Тяга ")) return "🚣 ";
    if (name.includes("Разведение ")) return "🔹 ";
    if (name.includes("Сгибание ")) return "💪 ";
    if (name.includes("Подъём ")) return "🦶 ";
    return "⚡ ";
}

function toggleTimer() { state.isRunning ? pauseTimer() : startTimer(); }

function startTimer() {
    state.isRunning = true;
    els.btnStart.textContent = "⏸ Пауза";
    els.btnStart.style.background = "#f39c12";
    if (!state.startTime) state.startTime = Date.now() - state.elapsedTime;
    requestWakeLock(); // <-- НЕ ДАЁМ ЭКРАНУ ГАСНУТЬ
    state.timerInterval = setInterval(() => {
        state.elapsedTime = Date.now() - state.startTime;
        els.totalTime.textContent = formatTime(state.elapsedTime);
    }, 1000);
}

function pauseTimer() {
    state.isRunning = false;
    els.btnStart.textContent = "▶ Старт";
    els.btnStart.style.background = "";
    clearInterval(state.timerInterval);
    releaseWakeLock(); // <-- возвращаем обычную блокировку
}

function resetWorkout() {
    pauseTimer();
    state.elapsedTime = 0;
    state.startTime = null;
    state.setsDone = 0;
    state.completedSupersets.fill(false);
    state.roundChecks.forEach(r => r.fill(false));
    Object.keys(state.exerciseChecks).forEach(k => state.exerciseChecks[k] = [false,false,false]);
    els.totalTime.textContent = "00:00:00";
    renderSupersets();
    updateStatsUI();
    els.completionScreen.classList.add('hidden');
    if (tg) tg.MainButton.hide();
}

window.toggleCheck = function(ssIndex, exIndex, setIndex) {
    if (!state.isRunning && state.elapsedTime === 0) startTimer();
    const key = `${ssIndex}_${exIndex}`;
    state.exerciseChecks[key][setIndex] = !state.exerciseChecks[key][setIndex];
    const container = document.getElementById(`checks-${key}`);
    container.querySelectorAll('.set-check')[setIndex].classList.toggle('completed', state.exerciseChecks[key][setIndex]);
    const done = state.exerciseChecks[key].filter(Boolean).length;
    document.getElementById(`status-${key}`).textContent = `${done}/3`;
    checkSupersetCompletion(ssIndex);
};

function checkSupersetCompletion(ssIndex) {
    const ss = workoutData[ssIndex];
    const allDone = ss.exercises.every((_, i) => state.exerciseChecks[`${ssIndex}_${i}`].every(Boolean));
    if (allDone && !state.completedSupersets[ssIndex]) {
        state.completedSupersets[ssIndex] = true;
        state.setsDone += 3;
        updateStatsUI();
        if (ssIndex === workoutData.length - 1) finishWorkout();
        else startRestTimer(ss.rest, `Отдых после СС${ssIndex + 1}`, `Далее: ${workoutData[ssIndex + 1].title.split('—')[1] || ''}`);
        return;
    }
    for (let r = 0; r < 2; r++) {
        const roundDone = ss.exercises.every((_, i) => state.exerciseChecks[`${ssIndex}_${i}`][r]);
        if (roundDone && !state.roundChecks[ssIndex][r]) {
            state.roundChecks[ssIndex][r] = true;
            startRestTimer(ss.intraRest || 60, 'Отдых внутри суперсета', `Подход ${r + 1}/3 выполнен • Далее: ${ss.exercises[0].name}`);
            break;
        }
    }
}

function startRestTimer(seconds, title, desc) {
    let remaining = seconds;
    els.restTitle.textContent = title;
    els.restDesc.textContent = desc;
    els.restTimer.textContent = formatRestTime(remaining);
    els.restOverlay.classList.remove('hidden');
    const intId = setInterval(() => {
        remaining--;
        els.restTimer.textContent = formatRestTime(remaining);
        if (remaining <= 0) { clearInterval(intId); skipRest(); }
    }, 1000);
    els.restOverlay.dataset.intervalId = intId;
}

function skipRest() {
    clearInterval(parseInt(els.restOverlay.dataset.intervalId));
    els.restOverlay.classList.add('hidden');
    if (!state.isRunning) startTimer();
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

function formatRestTime(sec) {
    return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
}

function updateStatsUI() {
    els.setsDone.textContent = state.setsDone;
    els.progressPercent.textContent = `${Math.round((state.setsDone / state.totalSets) * 100)}%`;
}

function finishWorkout() {
    pauseTimer();
    saveStats();
    els.finalStats.textContent = `Время: ${formatTime(state.elapsedTime)} • Подходов: ${state.setsDone}/${state.totalSets}`;
    els.completionScreen.classList.remove('hidden');
    if (tg) {
        tg.MainButton.setText("Завершить тренировку");
        tg.MainButton.show();
    }
}

function saveStats() {
    const stats = JSON.parse(localStorage.getItem('dw_stats')) || { total: 0, months: {}, best: Infinity };
    stats.total++;
    const now = new Date();
    const mKey = `${now.getFullYear()}-${now.getMonth()}`;
    stats.months[mKey] = (stats.months[mKey] || 0) + 1;
    if (state.elapsedTime < stats.best) stats.best = state.elapsedTime;
    localStorage.setItem('dw_stats', JSON.stringify(stats));
    loadStats();
}

function loadStats() {
    const stats = JSON.parse(localStorage.getItem('dw_stats')) || { total: 0, months: {}, best: Infinity };
    els.totalWorkoutsEl.textContent = stats.total;
    const now = new Date();
    els.monthWorkoutsEl.textContent = stats.months[`${now.getFullYear()}-${now.getMonth()}`] || 0;
    els.bestTimeEl.textContent = stats.best === Infinity ? "--:--" : formatTime(stats.best);
}

init();
