"""
dataset.py
Builds the training dataset for the AI Debugger Pro model.

Each sample = (code_snippet, label)
Labels are the *risk category* of the snippet. This is what the ML model learns.
Line-level detection is handled separately by rules.py.

To improve accuracy: add more real samples here. More data = better model.
"""

SAMPLES = [

    # ---------------- clean ----------------
    ("const total = items.reduce((a, b) => a + b, 0);", "clean"),
    ("let user = getUser(id);\nif (user) { render(user); }", "clean"),
    ("function add(a, b) {\n  return a + b;\n}", "clean"),
    ("<div class=\"card\"><p>Hello world</p></div>", "clean"),
    ("$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');\n$stmt->execute([$id]);", "clean"),
    ("SELECT name, email FROM customers WHERE active = 1;", "clean"),
    ("const data = await fetch(url).then(r => r.json());", "clean"),
    ("for (let i = 0; i < arr.length; i++) {\n  sum += arr[i];\n}", "clean"),
    ("$name = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');", "clean"),
    ("def get_user(uid):\n    return db.query(User).filter_by(id=uid).first()", "clean"),
    ("class Button extends Component {\n  render() { return <button />; }\n}", "clean"),
    ("body { margin: 0; padding: 0; box-sizing: border-box; }", "clean"),

    # ---------------- syntax_error ----------------
    ("const x = 5\nconst y = 10\nconsole.log(x + y)", "syntax_error"),
    ("function greet(name) {\n  return 'hi ' + name;\n", "syntax_error"),
    ("let total = 0\nfor (let i=0; i<10; i++ {\n total += i;\n}", "syntax_error"),
    ("<div class=\"wrapper\">\n  <p>Missing close", "syntax_error"),
    ("if (x > 5) {\n  doThing();\n", "syntax_error"),
    ("echo 'hello world'", "syntax_error"),
    ("$arr = array(1, 2, 3;", "syntax_error"),
    ("const obj = { a: 1, b: 2", "syntax_error"),
    ("<ul>\n<li>one\n<li>two\n", "syntax_error"),
    ("def broken(:\n    pass", "syntax_error"),
    ("var a = 1\nvar b = 2\nalert(a+b)", "syntax_error"),
    ("<a href=\"#\">Click", "syntax_error"),

    # ---------------- sql_injection ----------------
    ("$query = \"SELECT * FROM users WHERE id = \" . $_GET['id'];\nmysql_query($query);", "sql_injection"),
    ("query = \"SELECT * FROM users WHERE name = '\" + username + \"'\"", "sql_injection"),
    ("$sql = \"DELETE FROM posts WHERE id = {$_POST['pid']}\";", "sql_injection"),
    ("cursor.execute(\"SELECT * FROM t WHERE u = '%s'\" % user_input)", "sql_injection"),
    ("$result = mysqli_query($con, \"SELECT * FROM login WHERE user='$user' AND pass='$pass'\");", "sql_injection"),
    ("db.query('UPDATE users SET role = ' + req.body.role);", "sql_injection"),
    ("$q = \"INSERT INTO logs VALUES ('\" . $_REQUEST['msg'] . \"')\";", "sql_injection"),
    ("sql = f\"SELECT * FROM accounts WHERE email = '{email}'\"", "sql_injection"),
    ("mysql_query(\"SELECT * FROM products WHERE cat=\".$_GET['cat']);", "sql_injection"),
    ("exec(\"SELECT id FROM users WHERE token = '\" + token + \"'\")", "sql_injection"),

    # ---------------- xss_risk ----------------
    ("document.getElementById('out').innerHTML = userInput;", "xss_risk"),
    ("echo $_GET['name'];", "xss_risk"),
    ("element.innerHTML = '<p>' + comment + '</p>';", "xss_risk"),
    ("document.write(location.hash);", "xss_risk"),
    ("<div><?php echo $_POST['bio']; ?></div>", "xss_risk"),
    ("$('#box').html(req.query.msg);", "xss_risk"),
    ("res.send('<h1>' + req.params.title + '</h1>');", "xss_risk"),
    ("eval(userProvidedCode);", "xss_risk"),
    ("print('<div>' + request.args.get('q') + '</div>')", "xss_risk"),
    ("container.innerHTML = decodeURIComponent(window.location.search);", "xss_risk"),

    # ---------------- bad_practice ----------------
    ("console.log('debug value', secretToken);", "bad_practice"),
    ("var name = 'john';\nvar age = 30;\nvar city = 'NY';", "bad_practice"),
    ("<font color=\"red\">Old tag</font>", "bad_practice"),
    ("<center><marquee>scrolling</marquee></center>", "bad_practice"),
    ("$conn = mysql_connect('localhost', 'root', '');", "bad_practice"),
    ("<div style=\"color:red;font-size:20px;margin:10px\">inline</div>", "bad_practice"),
    ("if (x == '5') { doThing(); }", "bad_practice"),
    ("catch (e) { }", "bad_practice"),
    ("password = 'admin123'  # hardcoded", "bad_practice"),
    ("console.log(response); console.log(user); console.log(token);", "bad_practice"),
    ("$password = md5($_POST['pass']);", "bad_practice"),
    ("<table><tr><td><table><tr><td>nested layout</td></tr></table></td></tr></table>", "bad_practice"),
    ("var apiKey = 'sk-live-1234567890abcdef';", "bad_practice"),
    ("document.all('myDiv').style.color = 'red';", "bad_practice"),
]


def load_dataset():
    """Return (texts, labels)."""
    texts = [s[0] for s in SAMPLES]
    labels = [s[1] for s in SAMPLES]
    return texts, labels


LABEL_INFO = {
    "clean":         {"severity": "none",     "message": "No significant risk pattern detected."},
    "syntax_error":  {"severity": "high",     "message": "Code appears to contain a syntax error."},
    "sql_injection": {"severity": "critical", "message": "Possible SQL injection vulnerability."},
    "xss_risk":      {"severity": "critical", "message": "Possible cross-site scripting (XSS) risk."},
    "bad_practice":  {"severity": "medium",   "message": "Code quality / bad practice issues found."},
}
