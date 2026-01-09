/**
 * Menampilkan Modal Alert Kustom
 * @param {string} title - Judul modal (contoh: "Akses Dibatasi")
 * @param {string} message - Pesan isi modal
 * @param {string} redirectURL - (Opsional) URL tujuan saat tombol diklik. Jika null, hanya menutup modal.
 */
function showAlert(title = "Pemberitahuan", message = "Pesan sistem.", redirectURL = null) {
    // 1. Cek apakah modal sudah ada di DOM?
    let modalOverlay = document.getElementById('global-alert-modal');

    if (!modalOverlay) {
        // Jika belum, buat elemen modal secara dinamis
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'global-alert-modal';
        modalOverlay.className = 'custom-modal-overlay';

        modalOverlay.innerHTML = `
            <div class="custom-modal-content">
                <div class="modal-icon error-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
                <h2 id="global-modal-title">Judul</h2>
                <p id="global-modal-message">Pesan</p>
                <button id="global-modal-btn" class="modal-redirect-btn">OK</button>
            </div>
        `;

        document.body.appendChild(modalOverlay);
    }

    // 2. Set Konten
    document.getElementById('global-modal-title').textContent = title;
    document.getElementById('global-modal-message').textContent = message;

    const btn = document.getElementById('global-modal-btn');

    // 3. Atur Aksi Tombol
    btn.onclick = function () {
        closeAlert();
        if (redirectURL) {
            window.location.href = redirectURL;
        }
    };

    // 4. Tampilkan dengan Display Flex (untuk centering)
    modalOverlay.style.display = 'flex';
}

function closeAlert() {
    const modalOverlay = document.getElementById('global-alert-modal');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

// Expose ke global window agar bisa dipanggil darimana saja
window.showAlert = showAlert;
