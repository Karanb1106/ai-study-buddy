const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');
// level dropdown removed (College only) - no level selection needed
const loadingEl = document.getElementById('loading');

function showLoading() { loadingEl.classList.remove('hidden'); }
function hideLoading() { loadingEl.classList.add('hidden'); }

function makeCard(title, body, meta) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<h3>${title}</h3>${meta?`<div class="meta">${meta}</div>`:''}<pre>${body}</pre>`;
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn';
  copyBtn.style.marginTop = '8px';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', () => navigator.clipboard.writeText(body));
  div.appendChild(copyBtn);
  return div;
}

async function postJSON(url, body) {
  // Get backend URL from environment variable or use localhost for development
  const backendUrl = window.__BACKEND_URL__ || 'http://localhost:5173';
  const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
  const resp = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Safely handle empty or non-JSON responses
  const text = await resp.text();
  if (!text) {
    throw new Error(`Empty response from server (status ${resp.status})`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    // Return an object shaped like an error so callers can handle it
    return { error: `Invalid JSON response from server: ${text}` };
  }
}

function showError(err) {
  outputEl.innerHTML = '';
  outputEl.appendChild(makeCard('Error', err || 'Unknown error'));
}

document.getElementById('explain').addEventListener('click', async () => {
  const topic = inputEl.value.trim();
  if (!topic) return alert('Enter a topic or notes');
  outputEl.innerHTML = '';
  showLoading();
  try {
    const res = await postJSON('/api/explain', { topic });
    hideLoading();
    if (res.error) return showError(res.error);
    outputEl.appendChild(makeCard(`Explanation — ${res.topic}`, res.result || JSON.stringify(res, null, 2)));
  } catch (e) { hideLoading(); showError(e.message); }
});

document.getElementById('summarize').addEventListener('click', async () => {
  const notes = inputEl.value.trim();
  if (!notes) return alert('Paste notes to summarize');
  outputEl.innerHTML = '';
  showLoading();
  try {
    const res = await postJSON('/api/summarize', { notes, maxPoints: 4 });
    hideLoading();
    if (res.error) return showError(res.error);
    outputEl.appendChild(makeCard('Summary', res.summary || JSON.stringify(res, null, 2)));
  } catch (e) { hideLoading(); showError(e.message); }
});

document.getElementById('quiz').addEventListener('click', async () => {
  const source = inputEl.value.trim();
  if (!source) return alert('Enter a topic or notes');
  outputEl.innerHTML = '';
  showLoading();
  try {
    const res = await postJSON('/api/quiz', { source, count: 5 });
    hideLoading();
    if (res.error) return showError(res.error);
    
    const quizDiv = document.createElement('div');
    quizDiv.className = 'card';
    quizDiv.innerHTML = '<h3>Quiz - 5 MCQs</h3>';
    
    const quizContent = res.questions || JSON.stringify(res, null, 2);
    const lines = quizContent.split('\n').filter(line => line.trim());

    let currentQ = null;
    let correctLabel = null;
    lines.forEach((line) => {
      if (line.match(/^Q\d+:\s*/)) {
        if (currentQ) quizDiv.appendChild(currentQ);
        currentQ = document.createElement('div');
        currentQ.className = 'mcq-item';
        const q = line.replace(/^Q\d+:\s*/, '');
        currentQ.innerHTML = `<div class="question">${q}</div><div class="options"></div>`;
      } else if (currentQ && line.match(/^[A-D]\)/)) {
        const label = line.charAt(0).toUpperCase();
        const text = line.slice(2).trim();
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.setAttribute('data-label', label);
        opt.innerHTML = `<span class="opt-label">${label})</span> <span class="opt-text">${text}</span>`;
        currentQ.querySelector('.options').appendChild(opt);
      } else if (currentQ && line.toLowerCase().startsWith('correct answer')) {
        const m = line.match(/([A-D])/i);
        if (m) {
          correctLabel = m[1].toUpperCase();
          // highlight correct option
          const opts = currentQ.querySelectorAll('.option');
          opts.forEach(o => {
            if (o.getAttribute('data-label') === correctLabel) {
              o.classList.add('correct');
            }
          });
          currentQ.innerHTML += `<div class="answer"><strong>Correct Answer:</strong> ${correctLabel}</div>`;
        } else {
          currentQ.innerHTML += `<div class="answer"><strong>Correct Answer:</strong> ${line.replace(/correct answer:\s*/i, '')}</div>`;
        }
      } else if (currentQ && line.toLowerCase().startsWith('detailed explanation')) {
        currentQ.innerHTML += `<div class="solution"><strong>Detailed Explanation:</strong> ${line.replace(/detailed explanation:\s*/i, '')}</div>`;
      } else if (currentQ && line.toLowerCase().startsWith('detailed explanation:')) {
        currentQ.innerHTML += `<div class="solution"><strong>Detailed Explanation:</strong> ${line.replace(/detailed explanation:\s*/i, '')}</div>`;
      } else if (currentQ && line.toLowerCase().startsWith('detailed explanation'.toLowerCase())) {
        currentQ.innerHTML += `<div class="solution"><strong>Detailed Explanation:</strong> ${line}</div>`;
      }
    });

    if (currentQ) quizDiv.appendChild(currentQ);
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => navigator.clipboard.writeText(quizContent));
    quizDiv.appendChild(copyBtn);
    
    outputEl.appendChild(quizDiv);
  } catch (e) { hideLoading(); showError(e.message); }
});

document.getElementById('clear').addEventListener('click', () => {
  inputEl.value = '';
  outputEl.innerHTML = '';
});
