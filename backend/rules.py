"""
rules.py
Line-level detection. The ML model says WHAT KIND of risk a snippet has;
these rules say WHICH LINE and HOW TO FIX IT.

Add new rules by appending to RULES.
"""

import re

# (regex, language_filter, severity, title, suggestion)
RULES = [
    # --- security ---
    (r"mysql_(query|connect|fetch)", None, "critical",
     "Deprecated mysql_* function",
     "Use PDO or mysqli with prepared statements instead."),

    (r"(SELECT|INSERT|UPDATE|DELETE)[^\n]*(\$_(GET|POST|REQUEST)|\"\s*\.\s*\$|\+\s*\w+\s*\+)",
     None, "critical",
     "Possible SQL injection",
     "Never concatenate user input into SQL. Use parameterised queries: prepare(...) then execute([$value])."),

    (r"\.innerHTML\s*=", "javascript", "high",
     "Unsafe innerHTML assignment",
     "If the value comes from a user, use textContent instead, or sanitise the HTML first."),

    (r"\bdocument\.write\s*\(", "javascript", "high",
     "document.write() used",
     "document.write blocks parsing and is an XSS vector. Use DOM methods instead."),

    (r"\beval\s*\(", None, "critical",
     "eval() used",
     "eval executes arbitrary code. Replace it with JSON.parse or an explicit lookup."),

    (r"echo\s+\$_(GET|POST|REQUEST)", "php", "critical",
     "Unescaped user input echoed",
     "Wrap in htmlspecialchars($value, ENT_QUOTES, 'UTF-8') before output."),

    (r"(api[_-]?key|password|secret|token)\s*=\s*['\"][^'\"]{6,}['\"]", None, "high",
     "Hardcoded credential",
     "Move secrets to environment variables, never commit them."),

    (r"\bmd5\s*\(", None, "high",
     "md5 used for hashing",
     "md5 is broken for passwords. Use password_hash() in PHP or bcrypt/argon2 elsewhere."),

    # --- quality ---
    (r"console\.log\s*\(", "javascript", "low",
     "console.log left in code",
     "Remove debug logging before shipping to production."),

    (r"^\s*var\s+", "javascript", "low",
     "var used instead of let/const",
     "Use const by default, let when the value is reassigned."),

    (r"<(center|font|marquee|big|blink)\b", "html", "medium",
     "Deprecated HTML tag",
     "This tag was removed in HTML5. Use CSS for styling instead."),

    (r"style\s*=\s*\"[^\"]{25,}\"", "html", "low",
     "Long inline style",
     "Move these styles into your stylesheet and use a class."),

    (r"[^=!<>]==[^=]", "javascript", "medium",
     "Loose equality (==)",
     "Use === to avoid unexpected type coercion."),

    (r"catch\s*\([^)]*\)\s*\{\s*\}", None, "medium",
     "Empty catch block",
     "Swallowing errors hides bugs. Log the error or handle it explicitly."),
]


def _check_unclosed_tags(code):
    """Very light HTML tag balance check."""
    issues = []
    void = {"br", "hr", "img", "input", "meta", "link", "area", "base",
            "col", "embed", "source", "track", "wbr"}
    opens = re.findall(r"<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>", code)
    closes = re.findall(r"</([a-zA-Z][a-zA-Z0-9]*)\s*>", code)

    stack = {}
    for tag, selfclose in opens:
        t = tag.lower()
        if t in void or selfclose == "/":
            continue
        stack[t] = stack.get(t, 0) + 1
    for tag in closes:
        t = tag.lower()
        stack[t] = stack.get(t, 0) - 1

    for tag, count in stack.items():
        if count > 0:
            issues.append({
                "line": None,
                "severity": "high",
                "title": f"Unclosed <{tag}> tag",
                "code": "",
                "suggestion": f"Add the matching </{tag}> closing tag.",
            })
    return issues


def _check_brackets(code):
    """Check balanced braces/parens/brackets."""
    issues = []
    pairs = {"{": "}", "(": ")", "[": "]"}
    counts = {k: code.count(k) - code.count(v) for k, v in pairs.items()}
    names = {"{": "curly brace", "(": "parenthesis", "[": "square bracket"}
    for opener, diff in counts.items():
        if diff > 0:
            issues.append({
                "line": None,
                "severity": "high",
                "title": f"Unclosed {names[opener]}",
                "code": "",
                "suggestion": f"You have {diff} unmatched '{opener}'. Add the matching '{pairs[opener]}'.",
            })
        elif diff < 0:
            issues.append({
                "line": None,
                "severity": "high",
                "title": f"Extra {names[opener]}",
                "code": "",
                "suggestion": f"There are {abs(diff)} extra '{pairs[opener]}' characters.",
            })
    return issues


def _check_semicolons(code, language):
    """Flag JS/PHP statement lines that look like they're missing a semicolon."""
    if language not in ("javascript", "php"):
        return []
    issues = []
    keywords = ("if", "for", "while", "function", "else", "switch",
                "try", "catch", "class", "return")
    for i, raw in enumerate(code.split("\n"), start=1):
        line = raw.strip()
        if not line or line.startswith(("//", "/*", "*", "#", "<")):
            continue
        if line.endswith((";", "{", "}", ",", ":", "(")):
            continue
        # a line ending in ')' is only fine if it's a control structure header
        if line.endswith(")") and re.match(r"^(if|for|while|switch|catch|elseif)\b", line):
            continue
        if any(line.startswith(k) for k in keywords):
            continue
        if re.match(r"^(var|let|const|\$\w+|\w+\s*=|return\b|\w+\()", line):
            issues.append({
                "line": i,
                "severity": "medium",
                "title": "Possible missing semicolon",
                "code": line,
                "suggestion": "Add a ';' at the end of this statement.",
            })
    return issues


def analyze(code, language="javascript"):
    """Return a list of line-level issues."""
    issues = []
    lines = code.split("\n")

    for pattern, lang_filter, severity, title, suggestion in RULES:
        if lang_filter and lang_filter != language:
            continue
        for i, line in enumerate(lines, start=1):
            if re.search(pattern, line, re.IGNORECASE):
                issues.append({
                    "line": i,
                    "severity": severity,
                    "title": title,
                    "code": line.strip()[:160],
                    "suggestion": suggestion,
                })

    issues += _check_semicolons(code, language)
    issues += _check_brackets(code)
    if language == "html":
        issues += _check_unclosed_tags(code)

    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    issues.sort(key=lambda x: (order.get(x["severity"], 9), x["line"] or 0))
    return issues
