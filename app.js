/* ================= DOM ELEMENTS ================= */

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const loadingEl = document.getElementById("loading");

const explainBtn = document.getElementById("explain");
const summarizeBtn = document.getElementById("summarize");
const quizBtn = document.getElementById("quiz");
const clearBtn = document.getElementById("clear");


/* ================= ACTIVE BUTTON ================= */

function setActiveButton(activeBtn) {
  [explainBtn, summarizeBtn, quizBtn].forEach(btn =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}

setActiveButton(explainBtn);


/* ================= LOADING ================= */

function showLoading() {
  loadingEl.classList.remove("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}


/* ================= CARD MAKER ================= */

function makeCard(title, htmlContent) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <h3>${title}</h3>
    ${htmlContent}
  `;

  const copyBtn = document.createElement("button");
  copyBtn.className = "btn copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(div.innerText);
  };

  div.appendChild(copyBtn);
  return div;
}


/* ================= API CALL ================= */

async function postJSON(endpoint, body) {
  const backendUrl = window.__BACKEND_URL__;
  const fullUrl = `${backendUrl}${endpoint}`;

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
}

function showError(message) {
  outputEl.innerHTML = "";
  outputEl.appendChild(
    makeCard("Error", `<pre>${message}</pre>`)
  );
}


/* ================= EXPLAIN ================= */

explainBtn.addEventListener("click", async () => {
  setActiveButton(explainBtn);

  const topic = inputEl.value.trim();
  if (!topic) return alert("Enter a topic");

  outputEl.innerHTML = "";
  showLoading();

  try {
    const res = await postJSON("/api/explain", { topic });
    hideLoading();

    outputEl.appendChild(
      makeCard(
        `Explanation — ${res.topic || topic}`,
        `<pre>${res.result}</pre>`
      )
    );
  } catch (err) {
    hideLoading();
    showError(err.message);
  }
});


/* ================= SUMMARIZE ================= */

summarizeBtn.addEventListener("click", async () => {
  setActiveButton(summarizeBtn);

  const notes = inputEl.value.trim();
  if (!notes) return alert("Paste notes");

  outputEl.innerHTML = "";
  showLoading();

  try {
    const res = await postJSON("/api/summarize", {
      notes,
      maxPoints: 5,
    });

    hideLoading();

    const points = res.summary
      .split("\n")
      .filter(line => line.trim())
      .map(line => `<li>${line}</li>`)
      .join("");

    outputEl.appendChild(
      makeCard("Summary", `<ul class="summary-list">${points}</ul>`)
    );
  } catch (err) {
    hideLoading();
    showError(err.message);
  }
});


/* ================= QUIZ (FINAL CLEAN VERSION) ================= */

quizBtn.addEventListener("click", async () => {
  setActiveButton(quizBtn);

  const source = inputEl.value.trim();
  if (!source) return alert("Enter topic");

  outputEl.innerHTML = "";
  showLoading();

  try {
    const res = await postJSON("/api/quiz", {
      source,
      count: 5,
    });

    hideLoading();

    // Split questions using Q1:, Q2:, etc.
    const questionBlocks = res.questions
      .split(/Q\d+:/)
      .filter(q => q.trim());

    questionBlocks.slice(0, 5).forEach((block, index) => {

      const lines = block.split("\n").filter(l => l.trim());

      let questionText = lines[0];
      let options = [];
      let correctAnswer = "";
      let explanation = "";

      let optionCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Take ONLY first 4 options
        if (/^[A-D]\)/.test(line) && optionCount < 4) {
          options.push(line);
          optionCount++;
          continue;
        }

        // Capture Correct Answer
        if (line.startsWith("Correct Answer:")) {
          correctAnswer = line;
          continue;
        }

        // Capture Detailed Explanation only
        if (line.startsWith("Detailed Explanation:")) {
          explanation = line.replace("Detailed Explanation:", "").trim();
          continue;
        }

        // Stop when "Why others are wrong" appears
        if (line.startsWith("Why others are wrong")) {
          break;
        }
      }

      const container = document.createElement("div");
      container.className = "card quiz-card";

      container.innerHTML = `
        <h3>Question ${index + 1}</h3>

        <p class="question"><strong>${questionText}</strong></p>

        <div class="options">
          ${options.map(opt => `<div class="option">${opt}</div>`).join("")}
        </div>

        <p class="correct">${correctAnswer}</p>

        <p class="explanation">${explanation}</p>
      `;

      outputEl.appendChild(container);
    });

  } catch (err) {
    hideLoading();
    showError(err.message);
  }
});


/* ================= CLEAR ================= */

clearBtn.addEventListener("click", () => {
  inputEl.value = "";
  outputEl.innerHTML = "";
});


/* ================= BACKEND CHECK ================= */

window.addEventListener("load", async () => {
  try {
    await fetch(`${window.__BACKEND_URL__}/api/health`);
    console.log("✅ Backend Connected");
  } catch {
    console.warn("⚠ Backend unreachable");
  }
});
