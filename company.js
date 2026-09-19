/* company.js - powers the Company Services contact form.
   100% client-side for now: submissions are validated and stored in
   localStorage so this page works with zero backend setup.

   ---------------------------------------------------------------------
   SWAPPING IN A REAL BACKEND LATER:
   Replace the body of handleSubmit()'s "save locally" block with a
   fetch() POST to your own endpoint, e.g.:

     const res = await fetch("/api/contact", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
     });

   Keep the validation logic above it exactly as-is.
   --------------------------------------------------------------------- */

const STORAGE_KEY = "companyLeads";

const form        = document.getElementById("contactForm");
const submitBtn   = document.getElementById("submitBtn");
const formStatus  = document.getElementById("formStatus");

const fields = {
    fullName: document.getElementById("fullName"),
    email:    document.getElementById("email"),
    service:  document.getElementById("service"),
    budget:   document.getElementById("budget"),
    message:  document.getElementById("message")
};

const errors = {
    fullName: document.getElementById("err-fullName"),
    email:    document.getElementById("err-email"),
    service:  document.getElementById("err-service"),
    message:  document.getElementById("err-message")
};

/* ---------------- validation ---------------- */
function clearErrors() {
    Object.values(errors).forEach(el => { if (el) el.textContent = ""; });
}

function validate() {
    clearErrors();
    let valid = true;

    const name = fields.fullName.value.trim();
    if (!name) {
        errors.fullName.textContent = "Please enter your name.";
        valid = false;
    }

    const email = fields.email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errors.email.textContent = "Please enter your email.";
        valid = false;
    } else if (!emailPattern.test(email)) {
        errors.email.textContent = "Please enter a valid email address.";
        valid = false;
    }

    if (!fields.service.value) {
        errors.service.textContent = "Please select a service.";
        valid = false;
    }

    const message = fields.message.value.trim();
    if (!message) {
        errors.message.textContent = "Please add a few details about your project.";
        valid = false;
    } else if (message.length < 10) {
        errors.message.textContent = "Please add a bit more detail (10+ characters).";
        valid = false;
    }

    return valid;
}

/* ---------------- status message ---------------- */
function showStatus(type, msg) {
    formStatus.textContent = msg;
    formStatus.className = `form-status show ${type}`;
}

function hideStatus() {
    formStatus.className = "form-status";
    formStatus.textContent = "";
}

/* ---------------- local storage save ---------------- */
function saveLeadLocally(payload) {
    let existing = [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        existing = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(existing)) existing = [];
    } catch {
        existing = [];
    }
    existing.unshift(payload);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return true;
    } catch {
        return false;
    }
}

/* ---------------- submit handler ---------------- */
async function handleSubmit(e) {
    e.preventDefault();
    hideStatus();

    if (!validate()) {
        showStatus("error", "Please fix the highlighted fields and try again.");
        return;
    }

    const payload = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        submitted_at: Date.now(),
        fullName: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        service: fields.service.value,
        budget: fields.budget.value || null,
        message: fields.message.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // Simulate a short async "send" so the UI feels real; swap this whole
    // block for a fetch() call once a backend endpoint exists.
    await new Promise(resolve => setTimeout(resolve, 500));

    const saved = saveLeadLocally(payload);

    if (saved) {
        showStatus("success", `Thanks ${payload.fullName.split(" ")[0]}! Your request has been received — we'll be in touch soon.`);
        form.reset();
    } else {
        showStatus("error", "Could not save your request locally. Please try again or email us directly.");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
}

form.addEventListener("submit", handleSubmit);

/* clear a field's error as soon as the user starts fixing it */
Object.entries(fields).forEach(([key, el]) => {
    if (!el || !errors[key]) return;
    el.addEventListener("input", () => { errors[key].textContent = ""; });
    el.addEventListener("change", () => { errors[key].textContent = ""; });
});
