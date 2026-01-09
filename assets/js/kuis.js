const form = document.getElementById('quiz-form');
const hasilKuis = document.getElementById('hasil-kuis');

// Kunci Jawaban
const jawabanBenar = {
    soal1: 'B',
    soal2: 'C',
    soal3: 'A',
    soal4: 'B',
    soal5: 'A'
};

form.addEventListener('submit', function (e) {
    e.preventDefault();

    let skor = 0;
    const totalSoal = 5;
    const passingScore = 4;

    // Hitung Skor
    for (let i = 1; i <= totalSoal; i++) {
        const namaSoal = 'soal' + i;

        const jawabanUser = document.querySelector(`input[name="${namaSoal}"]:checked`);

        if (jawabanUser && jawabanUser.value === jawabanBenar[namaSoal]) {
            skor++;
        }
    }

    // Tampilkan Hasil
    hasilKuis.style.display = 'block';

    // Sembunyikan form
    form.style.display = 'none';

    if (skor >= passingScore) {
        // LULUS - Lanjut ke Indikator 2
        hasilKuis.innerHTML = `
            <div class="result-card success">
                <i class="fa-solid fa-circle-check result-icon"></i>
                <h2>Selamat! Kamu Lulus 🎉</h2>
                <div class="result-score">${skor}/5</div>
                <p>Anda telah menguasai materi Indikator 1. Klik tombol di bawah untuk lanjut ke Indikator berikutnya.</p>
                <div class="result-actions">
                    <a href="indikator2.html" class="btn-next">
                        <span>Lanjut ke Indikator 2</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    } else {
        // GAGAL - Kembali ke Materi Indikator 1
        hasilKuis.innerHTML = `
            <div class="result-card fail">
                <i class="fa-solid fa-circle-xmark result-icon"></i>
                <h2>Belum Lulus</h2>
                <div class="result-score">${skor}/5</div>
                <p>Maaf, kamu belum mencapai nilai minimal ${passingScore}/5. Silakan pelajari kembali materi dan coba lagi.</p>
                <div class="result-actions">
                    <a href="../pages/indikator1.html" class="btn-retry">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Ulangi Materi</span>
                    </a>
                </div>
            </div>
        `;
    }
});