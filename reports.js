/* reports.js - powers the User Reports module.
   100% client-side for now: reports are saved to localStorage so this page
   works with zero backend setup. debugger.js writes into the same storage
   key when the user clicks "Save to Reports" on the Debugger page.

   ---------------------------------------------------------------------
   SWAPPING IN THE REAL MYSQL BACKEND LATER (see README.md):
   Replace loadReports() / persistReports() with fetch() calls to your
   Flask /api/reports routes (GET to list, POST to save, DELETE to remove).
   Everything else (rendering, filtering, sorting, modal) stays the same,
   since it all just works off the `reports` array in memory.
   --------------------------------------------------------------------- */

const STORAGE_KEY = "debugReports";

/* ---------------- state ---------------- */
let reports = loadReports();
let pendingDeleteId = null;

/* ---------------- storage ---------------- */
function loadReports() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistReports() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
        /* storage unavailable or full — reports just won't persist */
    }
}

/* ---------------- DOM refs ---------------- */
const summaryStrip  = document.getElementById("summaryStrip");
const reportsList    = document.getElementById("reportsList");
const emptyState     = document.getElementById("emptyState");
const searchInput    = document.getElementById("searchInput");
const langFilter     = document.getElementById("langFilter");
const sortFilter     = document.getElementById("sortFilter");
const exportBtn      = document.getElementById("exportBtn");
const clearAllBtn    = document.getElementById("clearAllBtn");
const confirmModal   = document.getElementById("confirmModal");
const modalTitle     = document.getElementById("modalTitle");
const modalMsg       = document.getElementById("modalMsg");
const modalCancel    = document.getElementById("modalCancel");
const modalConfirm   = document.getElementById("modalConfirm");

/* ---------------- rendering ---------------- */
function renderSummary() {
    const total = reports.length;
    const avg = total === 0
        ? 0
        : Math.round(reports.reduce((sum, r) => sum + (r.score || 0), 0) / total);
    const totalIssues = reports.reduce((sum, r) => sum + (r.issue_count ?? (r.issues ? r.issues.length : 0)), 0);
    const clean = reports.filter(r => (r.issue_count ?? (r.issues ? r.issues.length : 0)) === 0).length;

    summaryStrip.innerHTML = `
      <div class="summary-card">
        <span class="num">${total}</span>
        <span class="lbl">Total reports</span>
      </div>
      <div class="summary-card ${avg >= 80 ? "good" : avg < 50 ? "bad" : ""}">
        <span class="num">${total ? avg : "–"}</span>
        <span class="lbl">Average score</span>
      </div>
      <div class="summary-card">
        <span class="num">${totalIssues}</span>
        <span class="lbl">Issues found</span>
      </div>
      <div class="summary-card good">
        <span class="num">${clean}</span>
        <span class="lbl">Clean runs</span>
      </div>`;
}

function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const lang = langFilter.value;
    const sort = sortFilter.value;

    let list = reports.filter(r => {
        const matchesLang = lang === "all" || r.language === lang;
        const label = (r.title || r.prediction?.label || "").toLowerCase();
        const code = (r.code || "").toLowerCase();
        const matchesQuery = !q || label.includes(q) || code.includes(q);
        return matchesLang && matchesQuery;
    });

    list = list.slice().sort((a, b) => {
        if (sort === "newest") return (b.saved_at || 0) - (a.saved_at || 0);
        if (sort === "oldest") return (a.saved_at || 0) - (b.saved_at || 0);
        if (sort === "score-high") return (b.score || 0) - (a.score || 0);
        if (sort === "score-low") return (a.score || 0) - (b.score || 0);
        return 0;
    });

    return list;
}

function renderList() {
    const list = getFiltered();

    if (reports.length === 0) {
        reportsList.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    if (list.length === 0) {
        reportsList.innerHTML = `
          <div class="reports-empty">
            <i class="fas fa-filter"></i>
            <p>No reports match your search/filter.</p>
          </div>`;
        return;
    }

    reportsList.innerHTML = list.map(r => reportCardHtml(r)).join("");

    // wire up per-card interactions
    list.forEach(r => {
        const card = document.getElementById(`report-${r.id}`);
        if (!card) return;

        card.querySelector(".toggle-details")?.addEventListener("click", () => {
            card.classList.toggle("expanded");
        });
        card.querySelector(".delete-report")?.addEventListener("click", (e) => {
            e.stopPropagation();
            askDelete(r.id, r.title || r.prediction?.label || "this report");
        });
        card.querySelector(".rerun-report")?.addEventListener("click", (e) => {
            e.stopPropagation();
            rerunInDebugger(r);
        });
    });
}

function reportCardHtml(r) {
    const issues = r.issues || [];
    const issueCount = r.issue_count ?? issues.length;
    const scoreClass = scoreClassFor(r.score);
    const dateStr = r.saved_at ? new Date(r.saved_at).toLocaleString() : "Unknown date";
    const label = escapeHtml(r.title || r.prediction?.label || "Untitled analysis");

    let detailsHtml = "";
    if (r.code) {
        detailsHtml += `<pre class="report-code">${escapeHtml(truncateCode(r.code))}</pre>`;
    }
    if (issues.length > 0) {
        detailsHtml += issues.map(issue => `
            <div class="mini-issue sev-${issue.severity || "low"}">
                <span class="sev-tag">${escapeHtml(issue.severity || "info")}</span>
                ${escapeHtml(issue.title || "")}${issue.line ? ` — line ${issue.line}` : ""}
            </div>`).join("");
    } else {
        detailsHtml += `<p style="color:#4ade80; font-size:0.85rem;"><i class="fas fa-check-circle"></i> No rule violations detected.</p>`;
    }

    return `
      <div class="report-card" id="report-${r.id}">
        <div class="report-top">
          <div class="report-score ${scoreClass}">${r.score ?? "–"}</div>
          <div class="report-meta">
            <span class="report-lang">${escapeHtml(r.language || "unknown")}</span>
            <div class="report-label">${label}</div>
            <div class="report-date"><i class="fas fa-clock"></i> ${dateStr}</div>
          </div>
          <div class="report-issues-count">${issueCount} issue(s)</div>
          <div class="report-actions">
            <button class="icon-btn toggle-details" type="button"><i class="fas fa-eye"></i> View</button>
            <button class="icon-btn rerun-report" type="button"><i class="fas fa-rotate-right"></i> Re-run</button>
            <button class="icon-btn danger delete-report" type="button"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
        <div class="report-details">${detailsHtml}</div>
      </div>`;
}

function scoreClassFor(score) {
    if (score == null) return "";
    if (score >= 80) return "good";
    if (score >= 50) return "mid";
    return "bad";
}

function truncateCode(code, maxLines = 40) {
    const lines = code.split("\n");
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join("\n") + `\n... (${lines.length - maxLines} more lines)`;
}

/* ---------------- delete flow ---------------- */
function askDelete(id, label) {
    pendingDeleteId = id;
    modalTitle.textContent = "Delete this report?";
    modalMsg.textContent = `"${label}" will be permanently removed from your local history.`;
    confirmModal.classList.add("open");
}

modalCancel.addEventListener("click", () => {
    pendingDeleteId = null;
    confirmModal.classList.remove("open");
});

modalConfirm.addEventListener("click", () => {
    if (pendingDeleteId === "__all__") {
        reports = [];
    } else if (pendingDeleteId != null) {
        reports = reports.filter(r => r.id !== pendingDeleteId);
    }
    persistReports();
    renderSummary();
    renderList();
    pendingDeleteId = null;
    confirmModal.classList.remove("open");
});

confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
        pendingDeleteId = null;
        confirmModal.classList.remove("open");
    }
});

/* ---------------- re-run in debugger ---------------- */
function rerunInDebugger(r) {
    try {
        sessionStorage.setItem("debuggerPrefill", JSON.stringify({
            code: r.code || "",
            language: r.language || "javascript"
        }));
    } catch { /* ignore */ }
    window.location.href = "debugger.html";
}

/* ---------------- export ---------------- */
exportBtn.addEventListener("click", () => {
    if (reports.length === 0) return;
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debug-reports.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

/* ---------------- clear all ---------------- */
clearAllBtn.addEventListener("click", () => {
    if (reports.length === 0) return;
    pendingDeleteId = "__all__";
    modalTitle.textContent = "Clear all reports?";
    modalMsg.textContent = `This will permanently delete all ${reports.length} saved report(s) from this browser.`;
    confirmModal.classList.add("open");
});

/* ---------------- filters ---------------- */
searchInput.addEventListener("input", renderList);
langFilter.addEventListener("change", renderList);
sortFilter.addEventListener("change", renderList);

/* ---------------- helpers ---------------- */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

/* ---------------- init ---------------- */
renderSummary();
renderList();
