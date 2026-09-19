/* learn.js - powers the Learn Website module.
   100% client-side: no backend/API calls needed for this page. */

const STORAGE_KEY = "learnProgress";

/* ---------------- lesson data ---------------- */
const TOPICS = [
  {
    id: "html",
    title: "HTML",
    icon: "fa-code",
    lessons: [
      {
        id: "html-structure",
        title: "Document Structure",
        content: `
          <p>Every HTML page starts with the same skeleton. The
          <strong>&lt;!DOCTYPE html&gt;</strong> line tells the browser to use
          modern HTML5 rules. Everything visible lives inside
          <strong>&lt;body&gt;</strong>; everything about the page itself
          (title, character set, linked stylesheets) lives inside
          <strong>&lt;head&gt;</strong>.</p>
          <ul>
            <li><strong>&lt;html&gt;</strong> — the root element of the page</li>
            <li><strong>&lt;head&gt;</strong> — metadata, title, CSS/JS links</li>
            <li><strong>&lt;body&gt;</strong> — the actual content users see</li>
          </ul>`,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, world!</h1>
</body>
</html>`,
        tip: "The lang attribute on &lt;html&gt; helps screen readers and search engines — don't skip it.",
        quiz: {
          question: "Which tag is the root element that wraps the entire HTML document?",
          options: ["<body>", "<html>", "<head>"],
          correctIndex: 1,
          explanation: "<html> is the root element — <head> and <body> both live inside it."
        }
      },
      {
        id: "html-semantics",
        title: "Common Tags & Semantics",
        content: `
          <p>Semantic tags describe the <em>purpose</em> of content, not just
          its appearance. This makes pages easier to read for both browsers
          and assistive technology, and it's exactly the pattern used in this
          project's own <code>index.html</code> (a &lt;nav&gt; for the navbar,
          a &lt;footer&gt; for the footer, etc).</p>
          <ul>
            <li><strong>&lt;header&gt; / &lt;nav&gt;</strong> — top banner and navigation links</li>
            <li><strong>&lt;main&gt;</strong> — the primary content of the page</li>
            <li><strong>&lt;section&gt; / &lt;article&gt;</strong> — grouped content blocks</li>
            <li><strong>&lt;footer&gt;</strong> — closing content, links, copyright</li>
          </ul>`,
        code: `<header>
  <nav>
    <a href="index.html">Home</a>
    <a href="learn.html">Learn</a>
  </nav>
</header>

<main>
  <section>
    <h2>Welcome</h2>
    <p>Page content goes here.</p>
  </section>
</main>

<footer>
  <p>&copy; 2026 AI Debugger Pro</p>
</footer>`,
        quiz: {
          question: "Which tag is meant to hold a page's primary navigation links?",
          options: ["<aside>", "<nav>", "<main>"],
          correctIndex: 1,
          explanation: "<nav> is the semantic tag reserved specifically for navigation links."
        }
      },
      {
        id: "html-forms",
        title: "Forms & Inputs",
        content: `
          <p>Forms collect user input and send it somewhere — usually a
          backend script. The <strong>action</strong> attribute says where
          the data goes, and <strong>method</strong> says how (GET appends
          data to the URL, POST sends it in the request body).</p>
          <p>Always pair an &lt;input&gt; with a &lt;label&gt; — it improves
          accessibility and lets users click the label to focus the field.</p>`,
        code: `<form action="/submit.php" method="POST">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <label for="msg">Message</label>
  <textarea id="msg" name="msg" required></textarea>

  <button type="submit">Send</button>
</form>`,
        tip: "GET requests are visible in the URL and get cached/bookmarked — never use GET for passwords or sensitive data.",
        quiz: {
          question: "Which form attribute tells the browser where to send the submitted data?",
          options: ["method", "action", "name"],
          correctIndex: 1,
          explanation: "action holds the URL/script that receives the submission; method controls GET vs POST."
        }
      }
    ]
  },
  {
    id: "css",
    title: "CSS",
    icon: "fa-paintbrush",
    lessons: [
      {
        id: "css-selectors",
        title: "Selectors & the Cascade",
        content: `
          <p>CSS applies styles using selectors, and when two rules conflict,
          <strong>specificity</strong> decides which one wins:</p>
          <ul>
            <li>Inline styles beat everything</li>
            <li>ID selectors (<code>#logo</code>) beat classes</li>
            <li>Classes (<code>.btn-primary-large</code>) beat plain tag selectors (<code>button</code>)</li>
          </ul>
          <p>This project relies almost entirely on classes (like
          <code>.btn-cta</code> and <code>.gradient-text</code>) rather than
          IDs for styling — it keeps specificity predictable and rules easy
          to reuse.</p>`,
        code: `/* Tag selector - low specificity */
button { color: white; }

/* Class selector - beats the tag rule above */
.btn-cta { color: black; }

/* ID selector - beats the class rule above */
#mainCta { color: cyan; }`,
        quiz: {
          question: "Which of these three selector types has the highest specificity?",
          options: ["A tag selector (e.g. p)", "A class selector (e.g. .card)", "An ID selector (e.g. #header)"],
          correctIndex: 2,
          explanation: "ID selectors are more specific than classes, which are more specific than plain tag selectors."
        }
      },
      {
        id: "css-box-model",
        title: "The Box Model",
        content: `
          <p>Every element is a rectangular box made of four layers, from
          the inside out: <strong>content</strong>, <strong>padding</strong>,
          <strong>border</strong>, and <strong>margin</strong>. By default,
          <code>width</code> only sets the content area — padding and border
          are added on top of it, which trips a lot of beginners up.</p>
          <p>Setting <code>box-sizing: border-box</code> (as this project's
          <code>* { box-sizing: border-box; }</code> reset does) makes
          <code>width</code> include padding and border, so elements are
          much easier to size predictably.</p>`,
        code: `* {
  box-sizing: border-box;
}

.card {
  width: 300px;      /* now includes padding + border */
  padding: 1.5rem;
  border: 1px solid #00d4ff;
  margin: 1rem;
}`,
        quiz: {
          question: "With box-sizing: border-box, what does the width property include?",
          options: [
            "Only the content area",
            "Content, padding, and border",
            "Only the margin"
          ],
          correctIndex: 1,
          explanation: "border-box folds padding and border into the declared width, instead of adding them on top."
        }
      },
      {
        id: "css-flexbox",
        title: "Flexbox Layout",
        content: `
          <p>Flexbox arranges items along a single row or column.
          Set <code>display: flex</code> on a container, then control
          spacing with <code>justify-content</code> (main axis) and
          <code>align-items</code> (cross axis). This exact pattern is what
          powers the navbar and card grids across this site.</p>`,
        code: `.nav-container {
  display: flex;
  justify-content: space-between; /* spread items apart */
  align-items: center;            /* vertically center them */
  gap: 1rem;
}`,
        tip: "Add flex-wrap: wrap so rows of cards drop to the next line on small screens instead of squeezing.",
        quiz: {
          question: "Which flexbox property controls alignment along the main axis?",
          options: ["align-items", "justify-content", "flex-wrap"],
          correctIndex: 1,
          explanation: "justify-content controls spacing/alignment along the main axis; align-items handles the cross axis."
        }
      }
    ]
  },
  {
    id: "php",
    title: "PHP",
    icon: "fa-server",
    lessons: [
      {
        id: "php-superglobals",
        title: "Variables & Superglobals",
        content: `
          <p>PHP variables start with <code>$</code>. Superglobals are
          built-in arrays available everywhere, without needing to be
          passed around: <code>$_GET</code> and <code>$_POST</code> hold
          submitted form data, <code>$_SESSION</code> holds data that
          persists across a user's visit (used for login systems).</p>
          <p><strong>Never trust these values directly.</strong> Anything a
          user can type into a form or URL is untrusted input until you
          validate or escape it — that's the whole idea behind this
          project's own AI Code Debugger module.</p>`,
        code: `<?php
$name = $_POST['name'] ?? '';
$id   = $_GET['id'] ?? '';

// Always validate/sanitize before using untrusted input
if (empty($name)) {
    $error = "Name is required.";
}
?>`,
        quiz: {
          question: "Which superglobal holds data submitted from a form using method=\"POST\"?",
          options: ["$_SESSION", "$_POST", "$_GET"],
          correctIndex: 1,
          explanation: "$_POST holds POSTed form fields; $_GET holds URL query parameters; $_SESSION persists across requests."
        }
      },
      {
        id: "php-control-flow",
        title: "Functions & Control Flow",
        content: `
          <p>PHP supports the same building blocks as most languages:
          <code>if/else</code> for branching, <code>for</code>/<code>while</code>
          for loops, and <code>function</code> for reusable logic.</p>`,
        code: `<?php
function greet($name) {
    if (empty($name)) {
        return "Hello, guest!";
    }
    return "Hello, " . htmlspecialchars($name) . "!";
}

$i = 0;
while ($i < 3) {
    echo greet("User $i") . "\\n";
    $i++;
}
?>`,
        tip: "htmlspecialchars() escapes user input before it's echoed into HTML — it's PHP's version of this project's escapeHtml() JS helper.",
        quiz: {
          question: "Which keyword repeats a block of code as long as a condition stays true?",
          options: ["function", "while", "return"],
          correctIndex: 1,
          explanation: "while (condition) { ... } loops until the condition becomes false."
        }
      },
      {
        id: "php-mysql-safety",
        title: "Connecting to MySQL Safely",
        content: `
          <p>The sample code loaded by the "Load Sample" button in this
          project's own AI Code Debugger is a real, classic vulnerability —
          it builds a SQL query by gluing a raw <code>$_GET</code> value
          onto a string:</p>`,
        code: `// VULNERABLE — flagged by this project's debugger
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $id;
$result = mysql_query($query);`,
        tip: "mysql_query() is also long removed from PHP — use mysqli or PDO instead.",
        quiz: {
          question: "What is the correct fix for building a SQL query with user input?",
          options: [
            "Concatenate the input directly into the query string",
            "Use a prepared statement with bound parameters",
            "Wrap the input in quotes and hope for the best"
          ],
          correctIndex: 1,
          explanation: "Prepared statements separate the query structure from the data, so user input can never change the query's meaning."
        }
      }
    ]
  },
  {
    id: "mysql",
    title: "MySQL",
    icon: "fa-database",
    lessons: [
      {
        id: "mysql-select",
        title: "SELECT & WHERE",
        content: `
          <p><code>SELECT</code> retrieves rows from a table.
          <code>WHERE</code> filters which rows come back — without it,
          every row in the table is returned.</p>`,
        code: `SELECT id, username, email
FROM users
WHERE id = ?;`,
        tip: "The ? is a placeholder for a prepared statement parameter — never paste a variable straight into the query string.",
        quiz: {
          question: "Which clause narrows a SELECT query down to specific rows?",
          options: ["ORDER BY", "WHERE", "FROM"],
          correctIndex: 1,
          explanation: "WHERE filters rows based on a condition; FROM just names the table, and ORDER BY only sorts results."
        }
      },
      {
        id: "mysql-write",
        title: "INSERT, UPDATE, DELETE",
        content: `
          <p>These three statements change data instead of reading it.
          <code>UPDATE</code> and <code>DELETE</code> are especially
          dangerous without a <code>WHERE</code> clause — leaving it off
          applies the change to <strong>every row in the table</strong>.</p>`,
        code: `INSERT INTO reports (user_id, score) VALUES (?, ?);

UPDATE reports SET score = ? WHERE id = ?;

DELETE FROM reports WHERE id = ?;`,
        quiz: {
          question: "What happens if you run UPDATE reports SET score = 0 without a WHERE clause?",
          options: [
            "Nothing changes until you confirm",
            "Every row in the reports table gets score = 0",
            "Only the first row is updated"
          ],
          correctIndex: 1,
          explanation: "Without WHERE, an UPDATE (or DELETE) applies to every single row in the table."
        }
      },
      {
        id: "mysql-joins",
        title: "Joins & Relationships",
        content: `
          <p>Real apps split data across multiple tables — for example,
          <code>users</code> and <code>reports</code> connected by a
          <code>user_id</code> foreign key. A <code>JOIN</code> combines
          rows from both tables that match on that key.</p>`,
        code: `SELECT reports.id, reports.score, users.username
FROM reports
INNER JOIN users ON reports.user_id = users.id
WHERE users.id = ?;`,
        quiz: {
          question: "Which JOIN type returns only rows that have a match in both tables?",
          options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN"],
          correctIndex: 0,
          explanation: "INNER JOIN keeps only rows where the join condition matches on both sides; LEFT JOIN would keep unmatched left-side rows too."
        }
      }
    ]
  },
  {
    id: "debugging",
    title: "Debugging Concepts",
    icon: "fa-bug",
    lessons: [
      {
        id: "debug-categories",
        title: "Common Bug Categories",
        content: `
          <p>This project's AI Code Debugger looks for two broad kinds of
          problems, using two different techniques:</p>
          <ul>
            <li><strong>Syntax errors</strong> — missing semicolons, unclosed
            tags/brackets. Caught with regex and bracket-balancing rules
            (see <code>rules.py</code>) — deterministic and exact, so it can
            point to a line number.</li>
            <li><strong>Risk patterns</strong> — SQL injection, XSS,
            deprecated functions. Classified by a trained model (see
            <code>train_model.py</code>) that scores the whole snippet with a
            confidence percentage, but can't point to a specific line.</li>
          </ul>
          <p>That's why the report combines both: the model says
          <em>how risky</em>, the rules say <em>where</em>.</p>`,
        quiz: {
          question: "A missing semicolon at the end of a JS statement is an example of what?",
          options: ["A logic error", "A syntax error", "An SQL injection risk"],
          correctIndex: 1,
          explanation: "Syntax errors break the language's grammar — missing semicolons, unclosed brackets/tags — and rule-based checks are great at catching them."
        }
      },
      {
        id: "debug-sqli",
        title: "SQL Injection Explained",
        content: `
          <p>SQL injection happens when untrusted input is inserted directly
          into a query string, letting an attacker change what the query
          actually does.</p>`,
        code: `// If $id is user input like:  1 OR 1=1
$query = "SELECT * FROM users WHERE id = " . $id;
// becomes:
// SELECT * FROM users WHERE id = 1 OR 1=1   <-- returns ALL users`,
        tip: "This is exactly what this project's own debugger flags as a critical, high-severity issue in its sample code.",
        quiz: {
          question: "What best describes SQL injection?",
          options: [
            "A slow database query",
            "An attacker manipulating a query's logic through unsanitized input",
            "A missing database index"
          ],
          correctIndex: 1,
          explanation: "SQL injection is about an attacker changing a query's meaning by sneaking SQL syntax into an input field."
        }
      },
      {
        id: "debug-xss",
        title: "XSS & Output Escaping",
        content: `
          <p>Cross-site scripting (XSS) happens when untrusted text is
          inserted into a page as raw HTML, letting it run as a script
          instead of displaying as plain text. This project's own
          <code>debugger.js</code> guards against exactly this with a small
          helper function before anything touches <code>innerHTML</code>:</p>`,
        code: `function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML; // safely encoded, can't execute as script
}`,
        tip: "The rule: never insert raw user or server text into innerHTML without escaping it first — even if you trust your own server.",
        quiz: {
          question: "What does escaping HTML output prevent?",
          options: [
            "Slow page load times",
            "Injected scripts from executing in the browser (XSS)",
            "SQL queries from running twice"
          ],
          correctIndex: 1,
          explanation: "Escaping turns characters like < and > into harmless entities, so injected markup/scripts render as text instead of executing."
        }
      }
    ]
  }
];

/* Flatten to a single ordered list for prev/next navigation */
const ALL_LESSONS = TOPICS.flatMap(topic =>
  topic.lessons.map(lesson => ({ ...lesson, topicId: topic.id, topicTitle: topic.title }))
);
const TOTAL_LESSONS = ALL_LESSONS.length;

/* ---------------- state ---------------- */
let completed = loadProgress();
let currentIndex = 0;

/* ---------------- persistence ---------------- */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    /* localStorage unavailable — progress just won't persist */
  }
}

/* ---------------- DOM refs ---------------- */
const topicNav        = document.getElementById("topicNav");
const lessonHeader     = document.getElementById("lessonHeader");
const lessonBody       = document.getElementById("lessonBody");
const quizBox          = document.getElementById("quizBox");
const quizQuestion     = document.getElementById("quizQuestion");
const quizForm         = document.getElementById("quizForm");
const quizSubmit       = document.getElementById("quizSubmit");
const quizFeedback     = document.getElementById("quizFeedback");
const prevBtn          = document.getElementById("prevLessonBtn");
const nextBtn          = document.getElementById("nextLessonBtn");
const lessonPosition   = document.getElementById("lessonPosition");
const progressBarFill  = document.getElementById("progressBarFill");
const progressText     = document.getElementById("progressText");
const resetProgressBtn = document.getElementById("resetProgressBtn");

/* ---------------- rendering ---------------- */
function renderSidebar() {
  topicNav.innerHTML = "";

  TOPICS.forEach(topic => {
    const block = document.createElement("div");
    block.className = "topic-block";
    const containsCurrent = topic.lessons.some(l => l.id === ALL_LESSONS[currentIndex].id);
    if (containsCurrent) block.classList.add("open");

    const doneCount = topic.lessons.filter(l => completed.has(l.id)).length;

    const head = document.createElement("button");
    head.type = "button";
    head.className = "topic-head";
    head.innerHTML = `
      <span class="topic-name"><i class="fas ${topic.icon}"></i> ${topic.title}</span>
      <span class="topic-count">${doneCount}/${topic.lessons.length}</span>
      <i class="fas fa-chevron-down chev"></i>`;
    head.addEventListener("click", () => {
      block.classList.toggle("open");
    });

    const list = document.createElement("ul");
    list.className = "lesson-list";

    topic.lessons.forEach(lesson => {
      const idx = ALL_LESSONS.findIndex(l => l.id === lesson.id);
      const item = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-item" + (idx === currentIndex ? " active" : "");
      const icon = completed.has(lesson.id) ? "fa-circle-check" : "fa-circle";
      btn.innerHTML = `<i class="fas ${icon}"></i> ${lesson.title}`;
      btn.addEventListener("click", () => goToLesson(idx));
      item.appendChild(btn);
      list.appendChild(item);
    });

    block.appendChild(head);
    block.appendChild(list);
    topicNav.appendChild(block);
  });
}

function renderLesson() {
  const lesson = ALL_LESSONS[currentIndex];

  lessonHeader.innerHTML = `
    <span class="lesson-topic-tag">${lesson.topicTitle}</span>
    <h2>${lesson.title}</h2>`;

  let bodyHtml = lesson.content || "";

  if (lesson.code) {
    bodyHtml += `
      <div class="code-block-wrap">
        <button class="copy-btn" type="button" data-code-id="${lesson.id}">
          <i class="fas fa-copy"></i> Copy
        </button>
        <pre class="code-block" id="code-${lesson.id}">${escapeHtml(lesson.code)}</pre>
      </div>`;
  }

  if (lesson.tip) {
    bodyHtml += `<div class="tip-box"><i class="fas fa-lightbulb"></i> ${lesson.tip}</div>`;
  }

  lessonBody.innerHTML = bodyHtml;

  const copyBtn = lessonBody.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => copyCode(lesson.id, copyBtn));
  }

  renderQuiz(lesson);

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === ALL_LESSONS.length - 1;
  lessonPosition.textContent = `Lesson ${currentIndex + 1} of ${ALL_LESSONS.length}`;

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function renderQuiz(lesson) {
  quizFeedback.hidden = true;
  quizFeedback.className = "quiz-feedback";
  quizFeedback.textContent = "";

  if (!lesson.quiz) {
    quizBox.style.display = "none";
    return;
  }
  quizBox.style.display = "block";

  quizQuestion.textContent = lesson.quiz.question;
  quizForm.innerHTML = "";

  lesson.quiz.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "quiz-option";
    label.innerHTML = `
      <input type="radio" name="quizOption" value="${i}">
      <span>${escapeHtml(opt)}</span>`;
    quizForm.appendChild(label);
  });

  quizSubmit.onclick = () => checkAnswer(lesson);
}

function checkAnswer(lesson) {
  const selected = quizForm.querySelector('input[name="quizOption"]:checked');
  if (!selected) {
    quizFeedback.hidden = false;
    quizFeedback.className = "quiz-feedback incorrect";
    quizFeedback.textContent = "Pick an option first.";
    return;
  }

  const chosen = parseInt(selected.value, 10);
  const isCorrect = chosen === lesson.quiz.correctIndex;

  quizFeedback.hidden = false;
  quizFeedback.className = "quiz-feedback " + (isCorrect ? "correct" : "incorrect");
  quizFeedback.innerHTML = `<strong>${isCorrect ? "Correct!" : "Not quite."}</strong> ${lesson.quiz.explanation}`;

  if (isCorrect && !completed.has(lesson.id)) {
    completed.add(lesson.id);
    saveProgress();
    renderSidebar();
    renderProgressBar();
  }
}

function renderProgressBar() {
  const done = completed.size;
  const pct = TOTAL_LESSONS === 0 ? 0 : Math.round((done / TOTAL_LESSONS) * 100);
  progressBarFill.style.width = pct + "%";
  progressText.textContent = `${done} / ${TOTAL_LESSONS} lessons complete`;
}

/* ---------------- helpers ---------------- */
function goToLesson(idx) {
  currentIndex = Math.max(0, Math.min(idx, ALL_LESSONS.length - 1));
  renderSidebar();
  renderLesson();
}

function copyCode(lessonId, btn) {
  const codeEl = document.getElementById(`code-${lessonId}`);
  if (!codeEl) return;
  const text = codeEl.textContent;

  const done = () => {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => { btn.innerHTML = original; }, 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch { /* ignore */ }
  document.body.removeChild(ta);
  done();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

/* ---------------- events ---------------- */
prevBtn.addEventListener("click", () => goToLesson(currentIndex - 1));
nextBtn.addEventListener("click", () => goToLesson(currentIndex + 1));

resetProgressBtn.addEventListener("click", () => {
  if (!confirm("Reset all lesson progress?")) return;
  completed = new Set();
  saveProgress();
  renderSidebar();
  renderProgressBar();
});

/* ---------------- init ---------------- */
renderSidebar();
renderLesson();
renderProgressBar();
