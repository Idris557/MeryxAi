// History array added from localStorage
let history = JSON.parse(localStorage.getItem("history") || "[]");

function updateHistory(prompt) {
    if (!prompt) return;
    history.push(prompt);
    if (history.length > 5) history.shift();
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyBox = document.getElementById("historyBox");
    if (!historyBox) return;

    historyBox.innerHTML = history
        .map(
            (item, idx) =>
                `<p class="history-item" data-index="${idx}">${item}</p>`
        )
        .join("");

    // Add click to refill input
    historyBox.querySelectorAll(".history-item").forEach(p => {
        p.addEventListener("click", () => {
            document.getElementById("userInput").value = p.innerText;
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submitBtn").addEventListener("click", askAI);
    setupCopy();
});

function setupCopy() {
    const copyBtn = document.getElementById("copyBtn");
    const aiResponse = document.getElementById("aiResponse");

    copyBtn.addEventListener("click", () => {
        const text = aiResponse.innerText.trim();
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerText = "Copied!";
            setTimeout(() => (copyBtn.innerText = "Copy"), 1000);
        });
    });
}

async function askAI() {
    const input = document.getElementById("userInput");
    const prompt = input.value.trim();
    if (!prompt) return;

    const userMessage = document.getElementById("userMessage");
    const aiDisplay = document.getElementById("aiDisplay");
    const aiResponse = document.getElementById("aiResponse");

    userMessage.innerText = "You: " + prompt;
    aiDisplay.innerText = "AI is thinking...";
    aiResponse.innerText = "";
    input.value = "";
    updateHistory(prompt);

    try {
        const res = await fetch(
            "https://gemini-christmas-worker.oluwatimilehin557.workers.dev",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            }
        );

        const data = await res.json();
        let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // The copied text
        aiResponse.innerText = raw;

        // Format for display
        const formatted = raw
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/_/g, "")
            .replace(/\*/g, "")
            .replace(/\n/g, "<br>");

        aiDisplay.innerHTML = "AI: " + formatted;
    } catch (err) {
        aiDisplay.innerText = "Error: " + err.message;
    }
}
