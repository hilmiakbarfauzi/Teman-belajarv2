const form = document.getElementById('quiz-form');
const hasilKuis = document.getElementById('hasil-kuis');
        
// Kunci Jawaban
const jawabanBenar = {
    soal1: 'B',
    soal2: 'C',
    soal3: 'A',
    soal4: 'B',
    soal5: 'A',
    soal6: 'B',
    soal7: 'B',
    soal8: 'B',
    soal9: 'B',
    soal10: 'B',
    soal11: 'B',
    soal12: 'B',
    soal13: 'B',
    soal14: 'B',
    soal15: 'C'
};

form.addEventListener('submit', function(e) {
    e.preventDefault();
            
    let skor = 0;
    const totalSoal = 15;
    const passingScore = 12;
            
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
    
    // Hapus kelas hasil sebelumnya
    hasilKuis.classList.remove('lulus', 'gagal');
            
    if (skor >= passingScore) {
        hasilKuis.classList.add('lulus');
        hasilKuis.innerHTML = `Skor Anda: ${skor} dari ${totalSoal}.<p>Selamat! Anda LULUS evaluasi. Nilai Anda: ${Math.round((skor / totalSoal) * 100)}/100.</p><a href="input-data.html?skor=${skor}" class="submit-btn" style="display:block; text-align:center;">Masukkan Data dan Cek Peringkat</a>`;
    } else {
        hasilKuis.classList.add('gagal');
        hasilKuis.innerHTML = `Skor Anda: ${skor} dari ${totalSoal}.<p>Maaf, Anda belum mencapai batas minimal ${passingScore}. Nilai Anda: ${Math.round((skor / totalSoal) * 100)}/100. Silakan ulangi rangkuman dan coba quiz ini lagi.</p><a href="input-data.html?skor=${skor}" class="submit-btn" style="background-color:#e53e3e; display:block; text-align:center;">Masukkan Data dan Cek Peringkat</a>`;
    }
});