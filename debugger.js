/* debugger.js - connects debugger.html to your Flask backend (app.py) */

// Flask serves both the API and the HTML pages, so same-origin "" works
// once you run app.py. Change this only if you host the API elsewhere.
const API_BASE = "";

const codeInput  = document.getElementById("codeInput");
const languageEl = document.getElementById("language");
const results    = document.getElementById("results");
const statusDot  = document.getElementById("statusDot");
const analyzeBtn = document.getElementById("analyzeBtn");
const saveRow      = document.getElementById("saveRow");
const saveReportBtn = document.getElementById("saveReportBtn");

const REPORTS_KEY = "debugReports";
let lastAnalysis = null; // holds { code, language, data } for the most recent successful run

const SAMPLE = `<?php
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $id;
$result = mysql_query($query)
echo $_GET['name'];
?>`;

/* ---------- check the backend is alive ---------- */
async function checkHealth() {
    try {
        const res  = await fetch(`${API_BASE}/api/health`);
        const data = await res.json();
        if (data.model_loaded) {
            statusDot.textContent = "Model ready";
            statusDot.className = "status-dot ok";
        } else {
            statusDot.textContent = "Server up, model missing";
            statusDot.className = "status-dot warn";
        }
    } catch {
        statusDot.textContent = "Server offline";
        statusDot.className = "status-dot err";
    }
}

/* ---------- main call ---------- */
async function analyze() {
    const code = codeInput.value.trim();

    if (!code) {
        showError("Please paste some code first.");
        lastAnalysis = null;
        saveRow.style.display = "none";
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing…';
    results.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Running analysis…</p></div>';

    try {
        const res = await fetch(`${API_BASE}/api/debug`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: code,
                language: languageEl.value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.error || "Something went wrong.");
            return;
        }

        render(data);
        lastAnalysis = { code, language: languageEl.value, data };
        saveRow.style.display = "flex";

    } catch (err) {
        showError("Could not reach the server. Is Flask running (python app.py)?");
        console.error(err);
        lastAnalysis = null;
        saveRow.style.display = "none";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-bolt"></i> Analyze Code';
    }
}

/* ---------- rendering ---------- */
function render(data) {
    const p = data.prediction;

    let html = `
      <div class="score-block">
        <div class="score-ring ${scoreClass(data.score)}">
          <span>${data.score}</span><small>/100</small>
        </div>
        <div class="score-meta">
          <p class="pred-label">${escapeHtml(p.label)}</p>
          <p class="pred-msg">${escapeHtml(p.message)}</p>
          <p class="pred-conf">Model confidence: <strong>${p.confidence}%</strong></p>
          <p class="pred-conf">${data.issue_count} issue(s) across ${data.lines_analyzed} line(s)</p>
        </div>
      </div>`;

    if (data.issues.length === 0) {
        html += `<div class="no-issues"><i class="fas fa-check-circle"></i>
                 No rule violations detected. Nice work.</div>`;
    } else {
        html += '<div class="issue-list">';
        data.issues.forEach(issue => {
            html += `
              <div class="issue sev-${issue.severity}">
                <div class="issue-head">
                  <span class="sev-badge">${issue.severity}</span>
                  <span class="issue-title">${escapeHtml(issue.title)}</span>
                  ${issue.line ? `<span class="issue-line">Line ${issue.line}</span>` : ""}
                </div>
                ${issue.code ? `<pre class="issue-code">${escapeHtml(issue.code)}</pre>` : ""}
                <p class="issue-fix"><i class="fas fa-wrench"></i> ${escapeHtml(issue.suggestion)}</p>
              </div>`;
        });
        html += "</div>";
    }

    results.innerHTML = html;
}

function scoreClass(score) {
    if (score >= 80) return "good";
    if (score >= 50) return "mid";
    return "bad";
}

function showError(msg) {
    results.innerHTML = `<div class="error-box"><i class="fas fa-triangle-exclamation"></i> ${escapeHtml(msg)}</div>`;
}

/* Always escape before inserting into innerHTML — never trust raw strings,
   even ones your own server generated. */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

/* ---------- events ---------- */
analyzeBtn.addEventListener("click", analyze);
document.getElementById("sampleBtn").addEventListener("click", () => {
    codeInput.value = SAMPLE;
    languageEl.value = "php";
});
document.getElementById("clearBtn").addEventListener("click", () => {
    codeInput.value = "";
    results.innerHTML = '<div class="empty-state"><i class="fas fa-microscope"></i><p>Your results will appear here.</p></div>';
    lastAnalysis = null;
    saveRow.style.display = "none";
});
codeInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") analyze();
});

/* ---------- save to reports (localStorage, matches reports.js) ---------- */
saveReportBtn.addEventListener("click", () => {
    if (!lastAnalysis) return;

    const { code, language, data } = lastAnalysis;
    const record = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        saved_at: Date.now(),
        title: data.prediction?.label ? data.prediction.label.replace(/_/g, " ") : "Analysis",
        code,
        language,
        score: data.score,
        prediction: data.prediction,
        issue_count: data.issue_count,
        lines_analyzed: data.lines_analyzed,
        issues: data.issues || []
    };

    let existing = [];
    try {
        const raw = localStorage.getItem(REPORTS_KEY);
        existing = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(existing)) existing = [];
    } catch {
        existing = [];
    }

    existing.unshift(record);

    try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(existing));
        const original = saveReportBtn.innerHTML;
        saveReportBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveReportBtn.disabled = true;
        setTimeout(() => {
            saveReportBtn.innerHTML = original;
            saveReportBtn.disabled = false;
        }, 1500);
    } catch {
        showError("Could not save report — local storage may be full or disabled.");
    }
});

/* ---------- prefill from a "Re-run" click on reports.html ---------- */
(function prefillFromReports() {
    try {
        const raw = sessionStorage.getItem("debuggerPrefill");
        if (!raw) return;
        sessionStorage.removeItem("debuggerPrefill");
        const { code, language } = JSON.parse(raw);
        if (code) codeInput.value = code;
        if (language) languageEl.value = language;
    } catch { /* ignore */ }
})();

checkHealth();
