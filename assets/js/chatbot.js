document.addEventListener("DOMContentLoaded", function () {
    // 1. Inject CSS Chatbot secara otomatis
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../assets/css/chatbot.css";
    document.head.appendChild(link);

    // 2. Inject HTML Komponen Chatbot ke dalam Body
    const chatbotHTML = `
        <button class="chatbot-toggler" id="chatbotToggler">
            <i class="fa-solid fa-comment-dots"></i>
        </button>

        <div class="chatbot-container" id="chatbotContainer">
            <div class="chatbot-header">
                <h3>Asisten Teman Belajar</h3>
                <button class="close-btn" id="closeChatBtn">&times;</button>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-message incoming">
                    Halo! Saya Asisten AI Teman Belajar. Ada yang bisa saya bantu terkait materi pelajaran hari ini?
                </div>
            </div>
            <div class="chat-footer">
                <input type="text" id="chatInput" placeholder="Ketik pertanyaan...">
                <button id="sendBtn"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    const chatbotDiv = document.createElement('div');
    chatbotDiv.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotDiv);

    // 3. Logika Interaksi & Integrasi API Gemini
    const toggler = document.getElementById("chatbotToggler");
    const container = document.getElementById("chatbotContainer");
    const closeBtn = document.getElementById("closeChatBtn");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBody = document.getElementById("chatBody");

    toggler.addEventListener("click", () => {
        container.classList.toggle("active");
    });

    closeBtn.addEventListener("click", () => {
        container.classList.remove("active");
    });

    // Masukkan API Key Google Gemini Anda yang valid di sini
    const GEMINI_API_KEY = "MASUKKAN_API_KEY_ANDA_DI_SINI";

    async function callGeminiAPI(userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Bertindaklah sebagai asisten edukasi untuk platform 'Teman Belajar' (sekolah MI/MTs/SMK IT IQRO). Jawablah pertanyaan berikut secara ramah, edukatif, dan ringkas: " + userMessage }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "Maaf, terjadi kesalahan saat memproses jawaban.";
            }
        } catch (error) {
            console.error("Error:", error);
            return "Maaf, tidak dapat terhubung ke server AI saat ini.";
        }
    }

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        // Tampilkan pesan pengguna di chatbox
        const userMsg = document.createElement("div");
        userMsg.className = "chat-message outgoing";
        userMsg.textContent = text;
        chatBody.appendChild(userMsg);

        chatInput.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;

        // Tampilkan indikator loading
        const loadingMsg = document.createElement("div");
        loadingMsg.className = "chat-message incoming";
        loadingMsg.textContent = "Sedang mengetik...";
        chatBody.appendChild(loadingMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Panggil API Gemini
        const aiReply = await callGeminiAPI(text);

        // Hapus pesan loading dan ganti dengan jawaban asli
        chatBody.removeChild(loadingMsg);

        const aiMsg = document.createElement("div");
        aiMsg.className = "chat-message incoming";
        aiMsg.textContent = aiReply;
        chatBody.appendChild(aiMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });
});