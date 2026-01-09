// 1. Import modul Firebase yang diperlukan
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

// 2. Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyBaFa2_d4almWd1wBlmPdzv9aGOa0e0m3A",
    authDomain: "daftarhadit-dfa3a.firebaseapp.com",
    projectId: "daftarhadit-dfa3a",
    storageBucket: "daftarhadit-dfa3a.firebasestorage.app",
    messagingSenderId: "438675023798",
    appId: "1:438675023798:web:3afc376cd435f0154fc317",
    measurementId: "G-XCNLPJSS57"
};

// Inisialisasi Firebase dan dapatkan instance Auth
const app = initializeApp(firebaseConfig); // <-- Ganti 'initializeContext' menjadi 'initializeApp'
const auth = getAuth(app);

// --- Bagian Kontrol Tampilan (Switch Form) ---

const container = document.getElementById('container');
const registerBtn = document.getElementById('register'); // Tombol 'Sign Up' di panel toggle
const loginBtn = document.getElementById('login');     // Tombol 'Sign In' di panel toggle

// Logika untuk menggeser panel tampilan (Sign In <-> Sign Up)
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// --- Bagian Logika Firebase Authentication ---

// Mendapatkan elemen formulir dan input
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');

const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupName = document.getElementById('signup-name'); // Input nama (opsional untuk Auth dasar)

const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');


// #################################################
// # 1. FUNGSI SIGN UP (Mendaftar)
// #################################################

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah refresh halaman

    const email = signupEmail.value;
    const password = signupPassword.value;
    const name = signupName.value; // Nilai nama

    if (password.length < 6) {
        alert("Password harus minimal 6 karakter.");
        return;
    }

    try {
        // Buat pengguna baru dengan email dan password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Jika Anda ingin menyimpan nama pengguna (display name), gunakan updateProfile
        // import { updateProfile } from "firebase/auth";
        // await updateProfile(user, { displayName: name }); 

        alert(`Pendaftaran berhasil! Selamat datang, ${name || user.email}!`);
        console.log("User terdaftar:", user);

        // Opsional: Otomatis pindah ke tampilan Sign In setelah daftar
        container.classList.remove("active");

        // Kosongkan form setelah sukses
        signupForm.reset();

    } catch (error) {
        const errorMessage = error.message;
        console.error("Kesalahan Pendaftaran:", errorMessage);

        // Tampilkan pesan error yang lebih mudah dimengerti pengguna
        if (error.code === 'auth/email-already-in-use') {
            alert('Email sudah terdaftar. Silakan Sign In atau gunakan email lain.');
        } else if (error.code === 'auth/invalid-email') {
            alert('Format email tidak valid.');
        } else {
            alert(`Pendaftaran gagal: ${errorMessage}`);
        }
    }
});


// #################################################
// # 2. FUNGSI SIGN IN (Masuk)
// #################################################

signinForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah refresh halaman

    const email = signinEmail.value;
    const password = signinPassword.value;

    try {
        // Masuk dengan email dan password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // alert(`Login berhasil! Selamat datang kembali, ${user.displayName || user.email}!`);
        console.log("User login:", user);

        // Check redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        if (redirectTo === 'kelas') {
            window.location.href = 'kelas.html';
        } else {
            window.location.href = 'home.html';
        }

        // Kosongkan form setelah sukses
        signinForm.reset();

    } catch (error) {
        const errorMessage = error.message;
        console.error("Kesalahan Login:", errorMessage);

        // Tampilkan pesan error yang lebih mudah dimengerti pengguna
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert('Email atau kata sandi salah. Silakan coba lagi.');
        } else {
            alert(`Login gagal: ${errorMessage}`);
        }
    }
});