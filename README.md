# AI Debugger Pro

A web-based code analysis tool that combines a trained machine learning classifier with a rule-based static analysis engine to flag security vulnerabilities and code-quality issues in JavaScript, PHP, Python, and HTML snippets.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![scikit--learn](https://img.shields.io/badge/scikit--learn-ML-orange)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---
<img width="1536" height="1024" alt="AI Debugger Pro Project Lifecycle" src="https://github.com/user-attachments/assets/84f63882-f64f-4624-b233-808c64a07f25" />

## Overview

Manual code review is slow, and common vulnerability patterns — SQL injection, unescaped output, deprecated unsafe functions — are easy for junior developers to miss, especially without a dedicated security reviewer on the team.

AI Debugger Pro lets a user paste a code snippet into a web interface and get back:

- A **risk classification** ("clean" or "vulnerable") with a model confidence score
- **Line-by-line issues** with severity ratings and concrete fix suggestions
- An overall **code quality score out of 100**

It's aimed at students, junior developers, and small teams who want a fast first-pass check before a real security review or code review.

### How it works, at a high level

The system uses two complementary layers rather than one:

1. A **machine learning classifier** (TF-IDF character n-grams → Logistic Regression) judges whether a snippet looks risky overall, with a confidence percentage.
2. A **deterministic rule engine** (regex + bracket/tag balancing) pinpoints the exact line, names the specific issue, and suggests a fix.

The ML layer is good at "does this feel risky?"; the rule layer is good at "which line, and why?" Combining them gives a more complete report than either alone.

---

## Key Features

- Hybrid detection: ML risk classification + deterministic rule-based line analysis
- Paste-and-analyze web interface (`debugger.html`)
- Language selector: JavaScript, PHP, Python, HTML, SQL (rule depth varies by language — JS and PHP are covered in the most depth)
- Severity-rated issues (critical / high / medium / low) with fix suggestions per line
- Numeric code quality score (0–100)
- REST API (Flask) that can be called independently of the bundled frontend
- Health-check endpoint for monitoring backend/model status
- Additional site pages: Home, Learn, Reports, Company — [Add a short description of what each page does]

---
## Application Preview
<img width="1536" height="1024" alt="ChatGPT Image Sep 18, 2026, 03_40_55 AM (1)" src="https://github.com/user-attachments/assets/c2bff715-9a9f-4df8-916d-1a444819b216" />


### Home Page

<img width="787" alt="AI Debugger Pro Home Page" src="https://github.com/user-attachments/assets/bcfb75ef-a6f2-4890-94f6-e4afb84f1f15" />

### Code Debugger

<table>
<tr>
<td>

<img width="520" alt="Code Debugger - PHP" src="https://github.com/user-attachments/assets/bc019165-70f5-4c3b-9be2-79c01dda765d" />

</td>
<td>

<img width="520" alt="Code Debugger - JavaScript" src="https://github.com/user-attachments/assets/a19843e2-ba13-4d6a-9228-1f8853d6d742" />

</td>
</tr>
</table>

### Learn Page

<table>
<tr>
<td>

<img width="520" alt="Learn Page" src="https://github.com/user-attachments/assets/9bb670c0-8ce9-4b20-9e07-12ae9eaf1ff9" />

</td>
<td>

<img width="520" alt="Learn Page - Lesson" src="https://github.com/user-attachments/assets/f31ffb71-fc55-4df8-8af3-37dde1a62954" />

</td>
</tr>
</table>

### Reports Page

<table>
<tr>
<td>

<img width="520" alt="Reports Page - JavaScript" src="https://github.com/user-attachments/assets/9e1e2241-8877-41cf-ab27-0be177a9f724" />

</td>
<td>

<img width="520" alt="Reports Page - Analysis" src="https://github.com/user-attachments/assets/4f875baf-464f-4dd4-9fb3-4d10cf28935a" />

</td>
</tr>
</table>

##  Demo

- **Live Demo:** Add your deployed application URL here
- **GitHub Repository:** Add your repository URL here

---

##  System Architecture

AI Debugger Pro uses a **hybrid code-analysis architecture** that combines a machine-learning classifier with a deterministic rule-based analysis engine.

The machine-learning component provides the overall vulnerability classification and confidence, while the rule-based engine identifies specific code-level issues, severity levels, affected lines, and suggested fixes.

### Architecture Overview

<img 
  width="900" 
  alt="AI Debugger Pro System Architecture" 
  src="https://github.com/user-attachments/assets/d92cb05b-58f3-4f04-bb2d-1cd0ebf35715" 
/>

*Figure: High-level architecture of the AI Debugger Pro application.*

###  Runtime Request Flow

The following flow represents the **actual runtime interaction** of the application when a user analyzes code:

```text
User
  │
  ▼
Debugger Frontend
(debugger.html + debugger.js)
  │
  │ POST /api/debug
  ▼
Flask Backend
(app.py)
  │
  ├───────────────┐
  ▼               ▼
ML Model       Rule Engine
model.pkl      rules.py
  │               │
  │               │
  ▼               ▼
Vulnerability   Line-level Issues
Classification   Severity
Confidence       Fix Suggestions
  │               │
  └───────┬───────┘
          ▼
   Combined Analysis
          │
          ▼
    Quality Score
          │
          ▼
     JSON Response
          │
          ▼
      Debugger UI
          │
          ▼
    Analysis Results
```

> **Note:** The training script that produced the production `model.pkl` currently loaded by `app.py` is not included in this repository. `train_model.py` documents a *different, reference* model (multiclass, small hand-written dataset) intended to demonstrate the approach. [Add the actual training script/notebook and dataset source used for `model.pkl` here.]

---

## Dataset

**Reference/example dataset** (`backend/dataset.py`): 58 hand-written code snippets across five categories — `clean`, `syntax_error`, `sql_injection`, `xss_risk`, `bad_practice` — covering JavaScript, PHP, Python, and HTML.

**Production model dataset:** [Add your dataset name(s), source, number of samples, and license here — e.g., Kaggle, Hugging Face, or a custom-collected set.]

---

## Data Preprocessing

For the reference pipeline (`dataset.py` → `train_model.py`):

- Code snippets are used as raw text (no HTML/comment stripping in this script)
- `TfidfVectorizer` extracts **character n-grams** (2–5 characters) rather than word tokens — this captures code-specific patterns like `$_GET[`, `" . $`, and `innerHTML=` that word tokenizers would destroy
- Labels are encoded directly as strings (`clean`, `sql_injection`, etc.)
- Data is split via `train_test_split` (stratified, 75/25) for a hold-out evaluation, in addition to 3-fold cross-validation

Preprocessing for the production `model.pkl` pipeline: [Add details here — this project's history includes a comment-stripping and deduplication step for a larger dataset, but the corresponding script isn't in this repository yet.]

---

## Model / AI Methodology

**Reference pipeline** (`train_model.py`):
- **Vectorizer:** `TfidfVectorizer(analyzer="char_wb", ngram_range=(2,5))`
- **Classifier:** `LogisticRegression(max_iter=2000, C=5.0, class_weight="balanced")`
- **Classes:** `clean`, `syntax_error`, `sql_injection`, `xss_risk`, `bad_practice`
- **Evaluation:** 3-fold cross-validation + a stratified hold-out split, printed at training time

**Production pipeline** (`backend/model/model.pkl`, loaded via `joblib.load`):
- **Classes:** binary — `0` (clean), `1` (vulnerable)
- **Interface:** `model.predict()` for the label, `model.predict_proba()` for confidence
- Training details (dataset, architecture, hyperparameters, final metrics): [Add here]

**Rule engine** (`rules.py`) — deterministic, not ML-based:
- Regex rules for SQL injection, `mysql_*` deprecated calls, unsafe `innerHTML`/`document.write`/`eval`, unescaped PHP `echo`, hardcoded credentials, `md5()` usage, loose equality, empty `catch` blocks, deprecated HTML tags
- Structural checks: unbalanced brackets/parentheses, unclosed HTML tags, likely missing semicolons
- Each issue returns a severity (`critical`/`high`/`medium`/`low`), the offending line, and a fix suggestion

**Combined scoring** (`app.py`): `score = 100 − Σ(severity weight)`, where weights are critical=25, high=15, medium=7, low=3, floored at 0.

---

## Results & Evaluation

> Evaluation results will be added after final model evaluation.

`train_model.py` prints cross-validation accuracy and a hold-out classification report at runtime for the reference model — actual numeric results have not yet been recorded in this repository for the production `model.pkl`.

---

## Installation

```bash
git clone [Add your repository URL here]
cd debug

python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install flask flask-cors scikit-learn joblib
```

To (re)train the reference model:

```bash
cd backend
python train_model.py
```

To start the application (requires `backend/model/model.pkl` to already exist):

```bash
cd backend
python app.py
```

---

## Usage

1. Run `python app.py` from the `backend/` folder.
2. Open `http://127.0.0.1:5000` in a browser.
3. Navigate to the Debugger page.
4. Paste a code snippet and select its language.
5. Click **Analyze Code**.
6. Review the score, model prediction/confidence, and the list of line-level issues with suggested fixes.

---

## API Documentation

| Method | Endpoint       | Description                              |
|--------|----------------|-------------------------------------------|
| GET    | `/`            | Serves `index.html`                       |
| GET    | `/<path>`      | Serves any static frontend file           |
| POST   | `/api/debug`   | Analyzes a code snippet                   |
| GET    | `/api/health`  | Reports server and model load status      |

### `POST /api/debug`

**Request body:**
```json
{
  "code": "$id = $_GET['id'];\n$query = \"SELECT * FROM users WHERE id = \" . $id;",
  "language": "php"
}
```

**Response:**
```json
{
  "language": "php",
  "lines_analyzed": 2,
  "prediction": {
    "label": "vulnerable",
    "confidence": 63.7,
    "message": "The model flagged this snippet as potentially risky."
  },
  "issues": [
    {
      "line": 2,
      "severity": "critical",
      "title": "Possible SQL injection",
      "code": "$query = \"SELECT * FROM users WHERE id = \" . $id;",
      "suggestion": "Never concatenate user input into SQL. Use parameterised queries: prepare(...) then execute([$value])."
    }
  ],
  "issue_count": 1,
  "score": 75
}
```

### `GET /api/health`

**Response:**
```json
{ "status": "ok", "model_loaded": true }
```

---

## Configuration / Environment Variables

This project currently uses no `.env` file, API keys, or database credentials. The model path is fixed relative to `app.py` (`backend/model/model.pkl`). If you deploy the API separately from the frontend, update `API_BASE` in `debugger.js` to point at your API's URL.

---

## Model / Large Files

```text
backend/model/
└── model.pkl
```

The current `model.pkl` is a few megabytes and safe to commit directly to GitHub. If you retrain on a much larger dataset and the file grows significantly (tens of MB+), use [Git LFS](https://git-lfs.github.com/) instead of committing it directly.

---

## Limitations

- The reference training dataset (`dataset.py`) is small (58 samples) and intended for demonstration, not production accuracy
- The rule engine is regex-based, not AST-based — it can produce false positives/negatives on unusual code formatting
- Language coverage is uneven: JavaScript and PHP have the most rules; Python, SQL, and HTML are lighter
- Model confidence on some inputs is close to 50%, indicating uncertainty rather than a strong signal
- This tool is a first-pass assistant, not a replacement for a professional security audit

---

## Future Improvements

- Expand training data with real-world vulnerable/safe code per supported language
- Replace regex checks with AST-based parsing for more accurate syntax and structural analysis
- Add support for additional languages
- Persist analysis history via the Reports page
- Add CI/CD integration (pre-commit hook or GitHub Action)
- Add explainability — highlight which tokens drove the model's prediction
- Containerize the backend with Docker for easier deployment

---

## Security / Privacy

Code submitted to `/api/debug` is processed in memory and is not persisted by the API itself. Users should avoid pasting real credentials or secrets into the debugger, even though `rules.py` specifically flags hardcoded credentials as a reminder to remove them. This project makes no security certification or compliance claims.

---

##  Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## License

No license file was found in this repository. Please choose a license (e.g., MIT, Apache 2.0) and add a `LICENSE` file to the repository root before publishing publicly.

---

##  Author

**Laiba Aamir**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Add your LinkedIn URL here]
