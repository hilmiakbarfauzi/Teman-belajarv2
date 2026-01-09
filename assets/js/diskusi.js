document.addEventListener("DOMContentLoaded", function () {
    const discussionContainer = document.getElementById('diskusi-wrapper');
    if (!discussionContainer) return;

    // --- State & Config ---
    const PAGE_ID = window.location.pathname.split("/").pop() || "indikator1.html";
    const INDICATOR_NAME = document.title.split("|")[0].trim() || "Indikator";

    let currentUser = null; // { uid, name, role }
    let comments = []; // Local mirror of Firestore data
    let unsubscribeArgs = null; // To detach listener if needed (SPA navigation)

    // --- HTML Template Injection ---
    const htmlTemplate = `
        <section id="diskusi-section">
            <div class="diskusi-card">
                <div class="diskusi-header">
                    <div class="diskusi-tabs">
                        <button class="tab-btn active" data-tab="qa">Tanya Jawab</button>
                        <button class="tab-btn" data-tab="umum">Diskusi Umum</button>
                    </div>
                </div>

                <div class="diskusi-input-area">
                    <textarea class="diskusi-textarea" id="comment-input" placeholder="Memuat status login..." disabled></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; color: #64748b;" id="user-status-text">Memeriksa akun...</span>
                        <button class="btn-post" id="btn-submit-comment" disabled>
                            <i class="fa-solid fa-paper-plane"></i> Kirim
                        </button>
                    </div>
                </div>

                <div class="komentar-list" id="komentar-list-container">
                    <div class="loading-spinner" style="padding:20px; text-align:center;">
                        <i class="fas fa-spinner fa-spin"></i> Memuat diskusi...
                    </div>
                </div>
            </div>
        </section>
    `;

    discussionContainer.innerHTML = htmlTemplate;

    // --- DOM Elements ---
    const listContainer = document.getElementById('komentar-list-container');
    const submitBtn = document.getElementById('btn-submit-comment');
    const inputField = document.getElementById('comment-input');
    const statusText = document.getElementById('user-status-text');

    // --- Firestore Init & Auth ---
    function initAuth() {
        const MAX_RETRIES = 50;
        let attempts = 0;

        const checkFirebase = setInterval(() => {
            if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
                clearInterval(checkFirebase);
                startSystem();
            } else {
                attempts++;
                if (attempts >= MAX_RETRIES) {
                    clearInterval(checkFirebase);
                    statusText.innerHTML = "Mode Offline (Firebase Timeout)";
                    showEmptyState();
                }
            }
        }, 100);
    }

    function startSystem() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // 1. Fetch Profile
                try {
                    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
                    if (doc.exists) {
                        const data = doc.data();
                        currentUser = {
                            uid: user.uid,
                            name: data.nama || user.email.split('@')[0],
                            role: data.role || 'siswa'
                        };
                        updateUILoggedIn();
                    } else {
                        console.warn("User profile missing in Firestore");
                        currentUser = { uid: user.uid, name: "User", role: "siswa" };
                        updateUILoggedIn();
                    }

                    // 2. Start Listener (Only after auth is confirmed)
                    if (!unsubscribeArgs) {
                        subscribeToComments();
                    }

                } catch (error) {
                    console.error("Profile load error:", error);
                    statusText.innerHTML = `<span style="color:#ef4444">Gagal memuat profil.</span>`;
                }
            } else {
                // Logged Out
                currentUser = null;

                // Stop Listener
                if (unsubscribeArgs) {
                    unsubscribeArgs();
                    unsubscribeArgs = null;
                    comments = [];
                }

                updateUILoggedOut();
            }
        });
    }

    function updateUILoggedIn() {
        statusText.innerHTML = `Masuk sebagai: <strong>${currentUser.name}</strong> <span class="badge-indicator" style="${currentUser.role === 'guru' ? 'background:#ecfdf5; color:#059669; border:1px solid #059669;' : 'background:#eff6ff; color:#2563eb;'}">${currentUser.role.toUpperCase()}</span>`;
        inputField.disabled = false;
        inputField.placeholder = currentUser.role === 'guru' ? "Tulis balasan untuk siswa..." : "Tulis pertanyaan atau komentar Anda...";
        submitBtn.disabled = false;
        renderComments(); // Re-render with new permissions if data already loaded
    }

    function updateUILoggedOut() {
        statusText.innerHTML = `<i class="fa-solid fa-lock"></i> <a href="index.html" style="color:#059669; text-decoration:underline;">Login</a> untuk berdiskusi.`;
        inputField.disabled = true;
        inputField.placeholder = "Silakan login untuk mulai berdiskusi.";
        submitBtn.disabled = true;
        renderComments();
    }

    // --- Firestore Realtime Listener ---
    function subscribeToComments() {
        // Query: Filter by Page ID, Order by Newest
        unsubscribeArgs = firebase.firestore().collection('discussion_comments')
            .where('indicatorId', '==', PAGE_ID)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                if (snapshot.empty) {
                    comments = [];
                } else {
                    comments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                }
                renderComments();
            }, (error) => {
                console.error("Listener Error:", error);
                if (error.code === 'permission-denied') {
                    statusText.innerHTML = "Akses Ditolak (Periksa Login)";
                }
            });
    }

    // --- Rendering ---
    function renderComments() {
        listContainer.innerHTML = '';

        if (comments.length === 0) {
            showEmptyState();
            return;
        }

        const isTeacher = currentUser && currentUser.role === 'guru';

        comments.forEach(comment => {
            // Safe replies handling
            const replies = comment.replies || [];

            const repliesHtml = replies.map(reply => {
                const deleteBtn = isTeacher ? `<button class="action-link text-red delete-reply-btn" data-parent="${comment.id}" data-id="${reply.id}" style="color:#ef4444; border:none; background:none;">Hapus</button>` : '';
                const starBadge = reply.isBest ? `<span class="badge-best"><i class="fa-solid fa-star"></i> Jawaban Terbaik</span>` : '';
                const markBestBtn = isTeacher ? `<button class="action-link mark-best-btn" data-parent="${comment.id}" data-id="${reply.id}" style="color:${reply.isBest ? '#999' : '#d97706'}; border:none; background:none; font-size:12px;"><i class="fa-${reply.isBest ? 'solid' : 'regular'} fa-star"></i> ${reply.isBest ? 'Batal Terbaik' : 'Tandai Terbaik'}</button>` : '';

                return `
                <div class="reply-item" ${reply.isBest ? 'style="background:#fffbeb; border:1px solid #fcd34d;"' : ''}>
                    <div class="komentar-meta">
                        <span class="komentar-avatar small ${reply.role === 'guru' ? 'guru' : ''}" style="width:24px; height:24px; font-size:10px;">${getInitials(reply.name)}</span>
                        <span class="user-name" style="font-size:13px;">${reply.name}</span>
                        <span class="user-role role-${reply.role}">${reply.role}</span>
                        ${starBadge}
                        <span class="time-ago">${formatTime(reply.createdAt)}</span>
                    </div>
                    <div class="komentar-text" style="font-size:14px;">${escapeHtml(reply.content)}</div>
                    
                    ${isTeacher ? `<div class="komentar-actions" style="margin-top:5px; padding-top:5px; border-top:1px dashed #e5e7eb;">${markBestBtn} ${deleteBtn}</div>` : ''}
                </div>
                `;
            }).join('');

            const deleteParentBtn = isTeacher ? `<span class="action-link delete-comment-btn" data-id="${comment.id}" style="color:#ef4444;">Hapus Topik</span>` : '';

            const itemHtml = `
            <div class="komentar-item">
                <div class="komentar-avatar ${comment.role === 'guru' ? 'guru' : ''}">
                    ${getInitials(comment.name)}
                </div>
                <div class="komentar-content">
                    <div class="komentar-meta">
                        <span class="user-name">${comment.name}</span>
                        <span class="user-role role-${comment.role}">${comment.role}</span>
                        <span class="time-ago">${formatTime(comment.createdAt)}</span>
                    </div>
                    <div class="komentar-text">${escapeHtml(comment.content)}</div>
                    
                    <div class="komentar-actions">
                        <span class="action-link reply-trigger" data-id="${comment.id}"><i class="fa-regular fa-comment-dots"></i> Balas</span>
                        ${deleteParentBtn}
                    </div>

                    ${replies.length > 0 ? `<div class="replies-container">${repliesHtml}</div>` : ''}
                </div>
            </div>
            `;
            listContainer.innerHTML += itemHtml;
        });
    }

    function showEmptyState() {
        listContainer.innerHTML = `
            <div style="padding:40px 20px; text-align:center; color:#94a3b8;">
                <i class="fa-regular fa-comments" style="font-size:48px; margin-bottom:15px; display:block; color:#cbd5e1;"></i>
                <p style="font-size:16px;">Belum ada diskusi.</p>
                <p style="font-size:14px;">Jadilah yang pertama bertanya atau berdiskusi disini.</p>
            </div>
        `;
    }

    // --- Actions (Write to Firestore) ---

    async function addComment() {
        if (!inputField.value.trim() || !currentUser) return;
        const text = inputField.value.trim();

        // 1. UI Feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            await firebase.firestore().collection('discussion_comments').add({
                indicatorId: PAGE_ID,
                userId: currentUser.uid,
                name: currentUser.name,
                role: currentUser.role,
                content: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                replies: []
            });

            inputField.value = '';
            Swal.fire({ icon: 'success', title: 'Terkirim', timer: 1000, showConfirmButton: false });

        } catch (e) {
            console.error(e);
            Swal.fire('Gagal', 'Komentar tidak terkirim. Coba lagi.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim';
        }
    }

    async function handleListClick(e) {
        // Reply
        if (e.target.closest('.reply-trigger')) {
            if (!currentUser) return Swal.fire('Login Dulu', 'Silakan login untuk membalas.', 'info');
            const docId = e.target.closest('.reply-trigger').dataset.id;

            const { value: text } = await Swal.fire({
                title: 'Balas Komentar',
                input: 'textarea',
                inputPlaceholder: 'Tulis balasan...',
                showCancelButton: true,
                confirmButtonText: 'Kirim',
                confirmButtonColor: '#059669'
            });

            if (text) {
                const docRef = firebase.firestore().collection('discussion_comments').doc(docId);
                const newReply = {
                    id: Date.now().toString(),
                    userId: currentUser.uid,
                    name: currentUser.name,
                    role: currentUser.role,
                    content: text,
                    createdAt: new Date().toISOString(), // Use string for easier array storage
                    isBest: false
                };

                try {
                    await docRef.update({
                        replies: firebase.firestore.FieldValue.arrayUnion(newReply)
                    });
                    Swal.fire('Berhasil', 'Balasan ditambahkan', 'success');
                } catch (err) {
                    Swal.fire('Gagal', 'Gagal membalas.', 'error');
                }
            }
        }

        // Delete (Teacher)
        if (e.target.closest('.delete-comment-btn')) {
            const docId = e.target.closest('.delete-comment-btn').dataset.id;
            Swal.fire({
                title: 'Hapus?',
                text: "Diskusi ini akan dihapus permanen.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Ya, Hapus'
            }).then(async (r) => {
                if (r.isConfirmed) {
                    await firebase.firestore().collection('discussion_comments').doc(docId).delete();
                }
            });
        }

        // Mark Best (Teacher) logic: Read -> Modify -> Write
        if (e.target.closest('.mark-best-btn')) {
            const docId = e.target.closest('.mark-best-btn').dataset.parent;
            const replyId = e.target.closest('.mark-best-btn').dataset.id;

            const docRef = firebase.firestore().collection('discussion_comments').doc(docId);

            try {
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    const data = docSnap.data();
                    const replies = data.replies || [];

                    // Toggle Logic
                    const updatedReplies = replies.map(r => {
                        if (r.id === replyId) return { ...r, isBest: !r.isBest }; // Toggle
                        return { ...r, isBest: false }; // Ensure only one is best? Or allow multiple? User req implies "The Best Answer", usually singular. Let's force singular.
                    });

                    await docRef.update({ replies: updatedReplies });
                    Swal.fire('Updated', 'Status jawaban diperbarui', 'success');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Gagal update status.', 'error');
            }
        }

        // Delete Reply (Teacher)
        if (e.target.closest('.delete-reply-btn')) {
            const docId = e.target.closest('.delete-reply-btn').dataset.parent;
            const replyId = e.target.closest('.delete-reply-btn').dataset.id;

            Swal.fire({ title: 'Hapus Balasan?', showCancelButton: true, confirmButtonText: 'Hapus', confirmButtonColor: '#d33' }).then(async (r) => {
                if (r.isConfirmed) {
                    const docRef = firebase.firestore().collection('discussion_comments').doc(docId);
                    const docSnap = await docRef.get();
                    if (docSnap.exists) {
                        const originalReplies = docSnap.data().replies;
                        const validReplies = originalReplies.filter(r => r.id !== replyId);
                        await docRef.update({ replies: validReplies });
                        Swal.fire('Terhapus', '', 'success');
                    }
                }
            });
        }
    }

    // --- Helpers ---
    function getInitials(name) {
        return name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or ISO String
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        return date.toLocaleDateString('id-ID'); // fallback
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Listeners ---
    submitBtn.addEventListener('click', addComment);
    listContainer.addEventListener('click', handleListClick);

    // Init
    initAuth();
});
