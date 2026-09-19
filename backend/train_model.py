"""
train_model.py
Trains the AI Debugger Pro classifier and saves it as model/model.pkl

Run:  python train_model.py
"""

import os
import pickle

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report

from dataset import load_dataset

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")


def build_pipeline():
    """
    Word tokens alone are weak on code (lots of symbols), so we use
    character n-grams. They capture things like '$_GET[' , '" . $' , 'innerHTML'
    which is exactly what distinguishes vulnerable code from safe code.
    """
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 5),
            min_df=1,
            sublinear_tf=True,
            lowercase=True,
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            C=5.0,
            class_weight="balanced",
        )),
    ])


def main():
    texts, labels = load_dataset()
    print(f"Loaded {len(texts)} samples across {len(set(labels))} classes.")

    pipe = build_pipeline()

    # Cross-validation gives an honest accuracy estimate on a small dataset.
    scores = cross_val_score(pipe, texts, labels, cv=3)
    print(f"Cross-val accuracy: {scores.mean():.2%} (+/- {scores.std():.2%})")

    # Hold-out report (useful to see which classes are weak)
    X_tr, X_te, y_tr, y_te = train_test_split(
        texts, labels, test_size=0.25, random_state=42, stratify=labels
    )
    pipe.fit(X_tr, y_tr)
    print("\nHold-out report:")
    print(classification_report(y_te, pipe.predict(X_te), zero_division=0))

    # Final model trained on ALL data (more data = better final model)
    final = build_pipeline()
    final.fit(texts, labels)

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(final, f)

    print(f"Saved model -> {MODEL_PATH}")

    # Quick sanity check
    demo = "$q = \"SELECT * FROM users WHERE id=\" . $_GET['id'];"
    print(f"\nSanity check: {final.predict([demo])[0]}")


if __name__ == "__main__":
    main()
