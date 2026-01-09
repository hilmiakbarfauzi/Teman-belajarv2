// video-loader.js
// Module untuk load dan render video H5P dari Firestore

// Import Firebase SDK dari CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Firebase Config (sama dengan konfigurasi yang ada)
const firebaseConfig = {
    apiKey: "AIzaSyBaFa2_d4almWd1wBlmPdzv9aGOa0e0m3A",
    authDomain: "daftarhadit-dfa3a.firebaseapp.com",
    projectId: "daftarhadit-dfa3a",
    storageBucket: "daftarhadit-dfa3a.firebasestorage.app",
    messagingSenderId: "438675023798",
    appId: "1:438675023798:web:3afc376cd435f0154fc317",
    measurementId: "G-XCNLPJSS57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Load video data untuk indikator tertentu dari Firestore
 * @param {string} indicatorId - ID indikator (contoh: 'indicator1', 'indicator2', 'indicator3')
 * @returns {Promise<Object|null>} - Video data atau null jika tidak ada/disabled
 */
export async function loadVideoData(indicatorId) {
    try {
        const docRef = doc(db, 'video_pembelajaran', indicatorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Cek apakah video enabled dan memiliki h5p_link
            if (data.enabled && data.h5p_link && data.h5p_link.trim() !== '') {
                return data;
            }
        }

        // Jika tidak ada data atau disabled, return null
        return null;

    } catch (error) {
        console.error(`Error loading video data for ${indicatorId}:`, error);
        return null;
    }
}

/**
 * Render video component ke dalam container HTML
 * @param {string} containerId - ID element container (contoh: 'video-container')
 * @param {Object} videoData - Data video dari Firestore
 */
export function renderVideoComponent(containerId, videoData) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container dengan ID '${containerId}' tidak ditemukan`);
        return;
    }

    // Jika tidak ada data video, sembunyikan container
    if (!videoData) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    // Template HTML untuk video component (Matches Indikator 1 Design)
    const videoHTML = `
        <article class="learning-card fade-in-up delay-2">
            <div class="card-header">
                <i class="fa-solid fa-play-circle"></i>
                <h2>Video Pembelajaran</h2>
            </div>
            <div class="card-body">
                <p class="mb-4">${videoData.description || 'Simak video berikut untuk memahami materi lebih dalam.'}</p>
                
                <div class="video-wrapper">
                    <iframe src="${videoData.h5p_link}"
                        title="${videoData.title || 'Video Pembelajaran'}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        </article>
    `;

    // Inject HTML ke container dan tampilkan
    container.innerHTML = videoHTML;
    container.style.display = 'block';
}

/**
 * Initialize video untuk halaman tertentu
 * Fungsi utama yang dipanggil dari setiap halaman quiz
 * @param {string} indicatorId - ID indikator
 * @param {string} containerId - ID container element
 */
export async function initVideo(indicatorId, containerId = 'video-container') {
    try {
        // Load data dari Firestore
        const videoData = await loadVideoData(indicatorId);

        // Render ke halaman
        renderVideoComponent(containerId, videoData);

        console.log(`Video untuk ${indicatorId}:`, videoData ? 'Loaded' : 'No video available');

    } catch (error) {
        console.error(`Error initializing video for ${indicatorId}:`, error);

        // Sembunyikan container jika ada error
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }
}
