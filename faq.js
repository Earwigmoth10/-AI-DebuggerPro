/* faq.js - accordion behavior for the FAQ section on index.html */

document.addEventListener("DOMContentLoaded", () => {
    const faqList = document.getElementById("faqList");
    if (!faqList) return;

    const items = faqList.querySelectorAll(".faq-item");

    items.forEach(item => {
        const question = item.querySelector(".faq-question");
        if (!question) return;

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // close every other item (single-open accordion)
            items.forEach(other => {
                if (other !== item) {
                    other.classList.remove("open");
                    other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
                }
            });

            // toggle the clicked item
            item.classList.toggle("open", !isOpen);
            question.setAttribute("aria-expanded", String(!isOpen));
        });
    });
});
