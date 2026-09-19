"""
app.py - Flask backend for AI Debugger Pro

Folder layout expected:
  debug/
    index.html, styles.css, debugger.html, debugger.js, debugger.css
    backend/
      app.py, rules.py           <- this file + line-level rule engine
      model/model.pkl            <- your vulnerability_pipeline.pkl (tfidf+classifier together)

Run:
    pip install flask flask-cors scikit-learn joblib
    python app.py
Then open http://127.0.0.1:5000

SECURITY NOTES (read before deploying anywhere public):
  - debug=False below. Flask's debug mode exposes an interactive
    Werkzeug console that lets anyone who triggers an unhandled
    exception run arbitrary Python on your server. Only ever turn it
    on locally, never on a public host.
  - static_files() explicitly blocks any request starting with
    "backend" so /backend/app.py, /backend/rules.py, and
    /backend/model/model.pkl can never be downloaded by a visitor.
    Without this, the catch-all route below would happily serve your
    source code and trained model to anyone who asks for that path.
  - CORS is scoped to /api/* only, not every route.
"""

import os
import warnings

import joblib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import rules

warnings.filterwarnings("ignore", category=UserWarning)  # sklearn version-mismatch warning

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

app = Flask(__name__, static_folder=None)

# Only /api/* is CORS-enabled. Set this to your real domain before deploying;
# "*" is fine for local development only.
CORS(app, resources={r"/api/*": {"origins": os.environ.get("ALLOWED_ORIGIN", "*")}})

# ---- load the pipeline once at startup ----
# IMPORTANT: this must be loaded with joblib, not pickle. joblib is what
# scikit-learn recommends for its own objects, and pickle.load can fail on
# files joblib produced.
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("Model loaded:", MODEL_PATH, "| classes:", getattr(model, "classes_", "?"))
else:
    print("WARNING: model.pkl not found at", MODEL_PATH)

LABEL_MESSAGES = {
    0: {"name": "clean", "message": "No significant risk pattern detected by the model."},
    1: {"name": "vulnerable", "message": "The model flagged this snippet as potentially risky."},
}


# ---------------- serve the frontend ----------------
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    # Never let this catch-all route hand out anything under backend/ -
    # that's where app.py, rules.py, dataset.py and model.pkl live.
    normalized = filename.replace("\\", "/").lstrip("/")
    if normalized == "backend" or normalized.startswith("backend/"):
        return jsonify({"error": "Not found."}), 404
    return send_from_directory(FRONTEND_DIR, filename)


# ---------------- API ----------------
@app.route("/api/debug", methods=["POST"])
def debug_code():
    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").strip()
    language = (data.get("language") or "javascript").lower()

    if not code:
        return jsonify({"error": "No code provided."}), 400
    if len(code) > 50000:
        return jsonify({"error": "Code too long (50k character limit)."}), 400

    # 1. ML model -> is this snippet risky, and how confident is it?
    prediction = {"label": "unknown", "confidence": 0.0, "message": "Model not loaded."}

    if model is not None:
        pred = int(model.predict([code])[0])
        proba = model.predict_proba([code])[0]
        confidence = float(max(proba))
        info = LABEL_MESSAGES.get(pred, {"name": str(pred), "message": ""})
        prediction = {
            "label": info["name"],
            "confidence": round(confidence * 100, 1),
            "message": info["message"],
        }

    # 2. Rule engine -> exact lines + fixes
    issues = rules.analyze(code, language)

    # 3. Score out of 100
    weights = {"critical": 25, "high": 15, "medium": 7, "low": 3}
    penalty = sum(weights.get(i["severity"], 0) for i in issues)
    score = max(0, 100 - penalty)

    return jsonify({
        "language": language,
        "lines_analyzed": len(code.split("\n")),
        "prediction": prediction,
        "issues": issues,
        "issue_count": len(issues),
        "score": score,
    })


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


if __name__ == "__main__":
    # debug=False on purpose - see the SECURITY NOTES at the top of this file.
    # Set FLASK_DEBUG=1 in your own local environment if you want the
    # debugger while developing, but never on a publicly reachable host.
    debug_mode = os.environ.get("FLASK_DEBUG") == "1"
    app.run(debug=debug_mode, port=5000)
