// --- DOM & State Management Mapping ---
const UI = {
    codeModeToggle: document.getElementById("codeMode"),
    pages: {
        calculator: document.getElementById("calculatorPage"),
        hub: document.getElementById("gamePage"),
        player: document.getElementById("playerPage")
    },
    grid: document.getElementById("gamesGrid"),
    frame: document.getElementById("gameFrame"),
    spinner: document.getElementById("loader"),
    title: document.getElementById("playerTitle"),
    tape: document.getElementById("history-tape")
};

let currentActiveUrl = "";

// --- Exact Requested Game Library (Only Mazeen, GTA: Vice City, Retro Bowl) ---
const gameLibrary = [
    {
        name: "Mazeen",
        description: "Official clean 3D maze browser application.",
        icon: "🌀",
        url: "https://mazean.com"
    },
    {
        name: "GTA: Vice City",
        description: "Fully verified open-world retro web client unblocked.",
        icon: "🌴",
        url: "https://newunblockedgames.gitlab.io/game/gta-vice-city-unblocked"
    },
    {
        name: "Retro Bowl",
        description: "Classic 8-bit style American football simulation.",
        icon: "🏈",
        url: "https://retrobowl.me/"
    }
];

// --- Advanced Calculator Engine ---
class Calculator {
    constructor(prevTextElem, currTextElem, tapeElem) {
        this.prevTextElem = prevTextElem;
        this.currTextElem = currTextElem;
        this.tapeElem = tapeElem;
        this.secretBuffer = "";
        this.history = [];
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.secretBuffer = "";
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.secretBuffer = this.secretBuffer.slice(0, -1);
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        if (UI.codeModeToggle.checked) this.secretBuffer += number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        if (this.previousOperand !== '') this.compute();
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    computeScientific(func) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        let result;
        switch(func) {
            case 'sin': result = Math.sin(current); break;
            case 'cos': result = Math.cos(current); break;
            case 'tan': result = Math.tan(current); break;
            case 'log': result = Math.log10(current); break;
        }
        this.addToHistory(`${func}(${current}) = ${result.toPrecision(8)}`);
        this.currentOperand = result.toPrecision(8).replace(/\.?0+$/, "");
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            default: return;
        }
        
        computation = Math.round(computation * 1000000000) / 1000000000;
        this.addToHistory(`${prev} ${this.operation} ${current} = ${computation}`);
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    applyPercent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
    }

    addToHistory(entry) {
        this.history.push(entry);
        if (this.history.length > 3) this.history.shift();
        this.tapeElem.innerText = this.history.join('\n');
    }

    updateDisplay() {
        this.currTextElem.innerText = this.currentOperand;
        if (this.operation != null) {
            this.prevTextElem.innerText = `${this.previousOperand} ${this.operation}`;
        } else {
            this.prevTextElem.innerText = '';
        }
    }

    checkUnlockCode() {
        if (UI.codeModeToggle.checked && (this.secretBuffer === "2013" || this.currentOperand === "2013")) {
            navigate('hub');
            this.clear();
            UI.codeModeToggle.checked = false;
        }
    }
}

const calculator = new Calculator(
    document.getElementById("previous-operand"),
    document.getElementById("current-operand"),
    document.getElementById("history-tape")
);

// --- Event Listeners for Calculator ---
document.querySelectorAll('.keypad button').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;
        const sci = button.dataset.sci;

        if (sci) calculator.computeScientific(sci);
        else if (!action) calculator.appendNumber(value);
        else if (action === 'clear') calculator.clear();
        else if (action === 'delete') calculator.delete();
        else if (action === 'percent') calculator.applyPercent();
        else if (action === 'operator') calculator.chooseOperation(value);
        else if (action === 'equals') {
            calculator.compute();
            calculator.checkUnlockCode();
        }
        calculator.updateDisplay();
    });
});

// --- Hub Rendering & Navigation System ---
function renderLibrary(filterText = "") {
    UI.grid.innerHTML = "";
    const filtered = gameLibrary.filter(g => g.name.toLowerCase().includes(filterText.toLowerCase()));
    
    filtered.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <button class="play-btn">Launch Client</button>
        `;
        card.addEventListener("click", () => bootGame(game));
        UI.grid.appendChild(card);
    });
}

function navigate(pageName) {
    Object.values(UI.pages).forEach(p => p.classList.add("hidden"));
    UI.pages[pageName].classList.remove("hidden");
}

function bootGame(game) {
    currentActiveUrl = game.url;
    UI.title.textContent = game.name;
    UI.frame.src = "about:blank"; 
    UI.spinner.style.display = "block";
    navigate('player');
    
    setTimeout(() => { UI.frame.src = game.url; }, 120);
}

UI.frame.addEventListener('load', () => {
    if(UI.frame.src !== "about:blank") UI.spinner.style.display = "none";
});

// --- Button Interactivity ---
document.getElementById("lockBtn").addEventListener("click", () => navigate('calculator'));
document.getElementById("backToVaultBtn").addEventListener("click", () => {
    UI.frame.src = "about:blank"; 
    navigate('hub');
});
document.getElementById("searchInput").addEventListener("input", (e) => renderLibrary(e.target.value));

document.getElementById("fullscreenBtn").addEventListener("click", () => {
    const wrapper = document.getElementById("iframeContainer");
    if (!document.fullscreenElement) wrapper.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
});

// --- Stealth Tab (Bypasses Frame Restrictions) ---
document.getElementById("stealthTabBtn").addEventListener("click", () => {
    if (!currentActiveUrl) return;
    
    let stealthWin = window.open('about:blank', '_blank');
    if (stealthWin) {
        let doc = stealthWin.document;
        doc.title = "Google Drive - Viewer";
        let link = doc.createElement('link');
        link.rel = 'icon';
        link.href = 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png';
        doc.head.appendChild(link);

        doc.body.style.margin = "0";
        doc.body.style.padding = "0";
        doc.body.style.overflow = "hidden";
        doc.body.style.backgroundColor = "#000";

        let embed = doc.createElement("iframe");
        embed.src = currentActiveUrl;
        embed.style.width = "100vw";
        embed.style.height = "100vh";
        embed.style.border = "none";
        embed.allowFullscreen = true;
        
        doc.body.appendChild(embed);
        UI.frame.src = "about:blank";
    } else {
        alert("Pop-ups are blocked. Please allow pop-ups for this tab to run Stealth Mode.");
    }
});

// --- Emergency Panic Key (ESC) ---
document.addEventListener("keydown", (e) => {
    e.key === "Escape" && UI.pages.calculator.classList.add("hidden") && (document.body.innerHTML = "", window.location.replace("https://classroom.google.com"));
});

// System Initialization
renderLibrary();