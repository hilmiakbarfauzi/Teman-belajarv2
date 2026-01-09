// Firebase Configuration & Initialization
const firebaseConfig = {
    apiKey: "AIzaSyBaFa2_d4almWd1wBlmPdzv9aGOa0e0m3A",
    authDomain: "daftarhadit-dfa3a.firebaseapp.com",
    projectId: "daftarhadit-dfa3a",
    storageBucket: "daftarhadit-dfa3a.firebasestorage.app",
    messagingSenderId: "438675023798",
    appId: "1:438675023798:web:3afc376cd435f0154fc317",
    measurementId: "G-XCNLPJSS57"
};

// Initialize only if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized via firebase-settings.js");
} else if (typeof firebase === 'undefined') {
    console.warn("Firebase SDK not loaded yet. Waiting for script load...");
}
