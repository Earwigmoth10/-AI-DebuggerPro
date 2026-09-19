# Frontend Testing Report — AI Debugger Pro

**Project:** AI Debugger Pro (AI Code Debugger, User Reports, Learn Website modules)
**Report type:** Manual frontend / UI test report
**Date:** September 18, 2026
**Evidence basis:** Provided source code (`index.html`, `styles.css`, `debugger.html/css/js`, `README.md`) and 11 screenshots of the running application

> This report is based strictly on the code and screenshots supplied. Any feature, flow, or outcome not shown in a screenshot or confirmed in the source code is marked **NOT TESTED** rather than assumed to pass.

---

## 1. Test Objective

The objective of this testing round was to verify the functional correctness and visual consistency of three frontend modules of AI Debugger Pro:

1. **AI Code Debugger** — submitting code, running analysis, and rendering the resulting risk score, prediction label, and line-level issues.
2. **User Reports** — persistence of analysis results and correctness of the aggregated summary statistics.
3. **Learn Website** — lesson navigation, content rendering, and progress tracking.

Testing focused on whether the UI accurately reflects the underlying logic in `debugger.js` / `debugger.css` (score thresholds, severity color-coding, JSON rendering) and whether data stays consistent as the user moves between the Debugger and Reports pages.

---

## 2. Testing Environment

| Item | Detail |
|---|---|
| Application type | Client-side web app (HTML/CSS/vanilla JS) with a Python backend (Flask + scikit-learn model, per `README.md`) |
| Frontend stack identified in code | HTML5, custom CSS (navy/cyan theme, no CSS framework detected), vanilla JavaScript (`fetch` API), Font Awesome 6.4.0 (via cdnjs) |
| Backend stack identified in code/README | Flask (`app.py`), TF-IDF + Logistic Regression model (`train_model.py` / `model.pkl`), rule-based checks (`rules.py`) |
| Operating system | Windows (taskbar visible in one screenshot) — not confirmed beyond that |
| Browser | Not identifiable — no browser chrome, address bar, or version info is visible in any screenshot |
| Viewport tested | Desktop/wide viewport only, in all screenshots |

---

## 3. Test Cases

| Test ID | Test Scenario | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Homepage module cards render | Load the homepage | "Learn Website", "User Reports", and "Company Services" cards each show an icon, title, description, status tag, and CTA button | All three cards render with correct icon, copy, tag ("Static + Dynamic", "Database Powered", "Static + Contact"), and CTA button ([Screenshot 01](screenshots/01-homepage-learn-card.png), [02](screenshots/02-homepage-reports-services-cards.png)) | **PASS** |
| TC-02 | Debugger page initial load | Open the Debugger page | Page shows "AI Code Debugger" heading, empty code panel, language dropdown, and a backend status badge | Header, empty textarea, and green "Model ready" badge all render correctly ([Screenshot 09](screenshots/09-debugger-js-syntax-result.png)) | **PASS** |
| TC-03 | Learn module sidebar navigation | Open Learn page; observe topic list | Topics are collapsible; the active lesson is highlighted; completed-lesson counts show per topic | "HTML" topic is expanded with "Document Structure" highlighted in cyan; other topics show correct `0/3` counts ([Screenshot 11](screenshots/11-learn-module.png)) | **PASS** |
| TC-04 | "Load Sample" button | Click "Load Sample" on the Debugger page | Textarea is populated with the built-in vulnerable PHP snippet from `debugger.js` | Code shown in the test matches the hard-coded `SAMPLE` constant in `debugger.js` exactly ([Screenshot 03](screenshots/03-debugger-php-vulnerable-result.png)) | **PASS** |
| TC-05 | Analyze vulnerable PHP code | Paste/load vulnerable PHP, select "PHP", click "Analyze Code" | Report should flag SQL injection, the deprecated `mysql_query()` call, unescaped output, and the missing semicolon | All four issues detected with correct severities (3× Critical, 1× Medium) and correct line numbers; score 18/100 ([Screenshot 03](screenshots/03-debugger-php-vulnerable-result.png)) | **PASS** |
| TC-06 | Analyze clean JavaScript | Paste the `calculateTotal` snippet, select "JavaScript", click "Analyze Code" | Should return a high score with zero or minimal issues | Returned score 97/100 with a single Low-severity issue (`console.log` left in code) — analysis itself completed correctly ([Screenshot 05](screenshots/05-debugger-js-clean-result.png)) | **PASS** (see TC-17 for a labeling inconsistency on this same result) |
| TC-07 | Analyze XSS-risk JavaScript | Paste the `innerHTML` snippet, select "JavaScript", click "Analyze Code" | Should flag the `innerHTML` assignment as a High-severity issue | Detected "Unsafe innerHTML assignment" at Line 2, severity High, with a correct suggested fix ([Screenshot 07](screenshots/07-debugger-js-xss-result.png)) | **PASS** |
| TC-08 | Analyze broken-syntax JavaScript | Paste code with an unclosed `{`, select "JavaScript", click "Analyze Code" | Bracket-balance check should catch the unclosed brace | Detected "Unclosed curly brace" (High) and a secondary "console.log left in code" (Low) issue ([Screenshot 09](screenshots/09-debugger-js-syntax-result.png)) | **PASS** |
| TC-09 | "Save to Reports" persistence | Click "Save to Reports" after each of the 4 analyses above | Reports page total count should increment by 1 after each save | Report count increased 1 → 2 → 3 → 4 across the four sequential Reports screenshots, matching the four analyses in order ([Screenshots 04](screenshots/04-reports-after-php-test.png), [06](screenshots/06-reports-after-js-clean-test.png), [08](screenshots/08-reports-after-js-xss-test.png), [10](screenshots/10-reports-after-js-syntax-test.png)) | **PASS** |
| TC-10 | Reports summary statistics accuracy | Save 4 analyses (scores 18, 97, 85, 82; issues 4, 1, 1, 2), open Reports page | "Average score" and "Issues found" totals should be calculated correctly | Final state shows Average = 71 (rounds from 70.5) and Issues = 8, both of which match the sums of the four saved reports exactly ([Screenshot 10](screenshots/10-reports-after-js-syntax-test.png)) | **PASS** |
| TC-11 | Report row action buttons render | Open Reports page with saved entries | Each report row shows "View", "Re-run", and "Delete" controls | All three controls render on every row in all four Reports screenshots | **PASS** (rendering only) |
| TC-12 | Report row action buttons — functionality | Click "View" / "Re-run" / "Delete" on a report row | Row expands / re-runs analysis / is removed from the list | No screenshot shows the result of clicking any of these controls | **NOT TESTED** |
| TC-13 | Reports toolbar controls render | Open Reports page | Search box, language filter, sort dropdown, "Export JSON", and "Clear All" should be visible | All controls render correctly and consistently across all four Reports screenshots | **PASS** (rendering only) |
| TC-14 | Reports toolbar controls — functionality | Use search/filter/sort/export/clear | Results filter, sort, export, or clear the list as expected | No screenshot demonstrates any of these being exercised | **NOT TESTED** |
| TC-15 | Score-ring color thresholds | Compare ring colors for scores 18, 97, 85, 82 against `scoreClass()` in `debugger.js` (≥80 = green, 50–79 = yellow, <50 = red) | Rings should color accordingly | 18 → red ring, 97/85/82 → green rings — all match the threshold logic in the source code | **PASS** |
| TC-16 | Issue severity badge colors | Compare Critical/High/Medium/Low badges against `debugger.css` severity classes | Each severity should use its own distinct color | Critical = red, High = orange, Medium = yellow, Low = blue, consistently across all four analyses | **PASS** |
| TC-17 | Prediction label reflects actual risk | Compare the "Vulnerable"/clean label against the score and issue severity for each of the 4 tests | A 97/100 result with only one Low-severity style issue should not be labeled the same as an 18/100 result with 3 Critical issues | **All four tests — including the 97/100 result — were labeled "Vulnerable."** The label does not appear to vary with score or severity in any of the observed cases | **FAIL** |
| TC-18 | Line-number reference consistency | Compare the "Line N" tag across all detected issues | Every issue card should show a line reference, per the `.issue-line` styling used elsewhere | The "Unclosed curly brace" issue is the only one across all tests missing a "Line N" tag ([Screenshot 09](screenshots/09-debugger-js-syntax-result.png)) | **FAIL** |
| TC-19 | Language selection reflected in results | Select PHP vs. JavaScript before analyzing | The resulting report/report-list entry should tag the correct language | PHP test tagged "PHP"; all three JS tests tagged "JAVASCRIPT" in both the report and the Reports list | **PASS** |
| TC-20 | Malformed input robustness | Submit code where a stray word ("javascript") was pasted in as the first line along with the actual code | App should not crash and should still analyze the real code | Analysis completed normally and still correctly detected the unclosed brace and leftover `console.log` ([Screenshot 09](screenshots/09-debugger-js-syntax-result.png)) | **PASS** |
| TC-21 | File upload for code input | Look for a file-upload control on the Debugger page | N/A — no upload control found in `debugger.html` (paste-only `<textarea>`) | Feature is not implemented in the provided source | **N/A** (not implemented) |
| TC-22 | `/api/debug` response rendering | Submit code and inspect the rendered report | Score, prediction label, confidence %, issue count, and line count should all render from the JSON response per `render()` in `debugger.js` | All fields rendered correctly and consistently across all 4 tests | **PASS** |
| TC-23 | Reports persistence matches documented architecture | Compare Reports page behavior against the MySQL-backed design described in `README.md` | Reports should be saved via a backend `/api/reports` route into MySQL | An on-page banner states reports are currently saved in **browser localStorage, not MySQL**, and that `reports.js` still needs to be swapped to call `/api/reports` ([Screenshot 04](screenshots/04-reports-after-php-test.png)) | **FAIL** (deviation from documented design — clearly disclosed to the user, not hidden) |
| TC-24 | Error handling — server offline | Simulate the backend being unreachable | UI should show "Could not reach the server..." per the `catch` block in `debugger.js` | No screenshot shows this state | **NOT TESTED** |
| TC-25 | Input validation — empty submission | Click "Analyze Code" with an empty textarea | UI should show "Please paste some code first." per `analyze()` in `debugger.js` | No screenshot shows this state | **NOT TESTED** |
| TC-26 | Learn module quiz interaction | Select a quiz answer and click "Check Answer" | Feedback (correct/incorrect) should appear and progress should update | Screenshot shows the quiz only in its unanswered state (0/15 lessons complete) | **NOT TESTED** |
| TC-27 | Responsive/mobile layout | View the app on a narrow/mobile viewport | Layout should reflow to a single column per the `@media` rules in `debugger.css`/`learn.css` | No mobile or narrow-viewport screenshots were provided | **NOT TESTED** |
| TC-28 | Visual/UI consistency across modules | Compare theme, typography, spacing, and button styles across Debugger, Reports, and Learn pages | All modules should share the same navy/cyan theme and component styling | Consistent dark navy background, cyan accents, card styling, and button treatment across all 11 screenshots | **PASS** |

---

## 4. Issues / Observations

- **Prediction label does not track risk level (TC-17):** All four tested snippets — including a 97/100 "clean" JavaScript function — were labeled **"Vulnerable."** This makes the label misleading on otherwise strong results and should be re-checked in the model/label-mapping logic.
- **Missing line reference on one issue type (TC-18):** The "Unclosed curly brace" issue does not display a line number, unlike every other issue card. Likely a gap in how that specific rule in `rules.py` reports its match location.
- **Model confidence stays in a narrow band:** Across four very different snippets, confidence ranged only from 56.8%–68.5%, never climbing much higher even for the clean JS sample. This lines up with `README.md`'s own note that cross-validation accuracy is only ~50% on 58 training samples — more training data (as the README already recommends) would likely widen and sharpen this range.
- **Reports storage doesn't yet match the documented design:** The Reports page currently persists data in the browser's `localStorage`, while `README.md` describes a MySQL-backed `/api/reports` flow. This is transparently disclosed to the user via an on-page banner, so it isn't a hidden defect, but it is a real gap between current behavior and the documented architecture.
- **Several flows remain unverified:** report-row actions (View/Re-run/Delete), Reports toolbar controls (search/filter/sort/export/clear), the Learn quiz's answer-and-feedback flow, empty-input validation, offline-server error handling, and any mobile/responsive layout were not exercised in the provided screenshots.
- **No file-upload option exists** for submitting code — only manual paste into the textarea is currently supported.

---

## 5. Testing Summary

| Metric | Count |
|---|---|
| Total test cases | 28 |
| Passed | 18 |
| Failed | 3 |
| Not Tested | 6 |
| Not Applicable (feature not implemented) | 1 |

**Overall assessment:** Core functionality of the AI Code Debugger (code submission, analysis, score/severity rendering) and the Learn Website module (navigation, lesson content) worked correctly and consistently across all tested scenarios. The Reports module correctly persists and aggregates data, though currently via `localStorage` rather than the MySQL backend described in the project's own README. The most notable functional defect is the prediction label ("Vulnerable") not varying with the actual score or issue severity. Several interactive flows and edge cases (error states, validation, mobile layout, quiz interaction, report-row actions) have no supporting evidence and should be tested and documented separately before this report is considered a complete regression suite.
