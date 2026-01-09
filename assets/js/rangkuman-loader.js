/**
 * rangkuman-loader.js
 * Automatically fetches content from Indikator pages to populate the Rangkuman page.
 */

const indicators = [
    { file: 'indikator1.html', id: 'indicator1', icon: 'fa-shield-halved' },
    { file: 'indikator2.html', id: 'indicator2', icon: 'fa-user-lock' },
    { file: 'indikator3.html', id: 'indicator3', icon: 'fa-network-wired' }
];

async function fetchIndicator(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return doc;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

async function loadRangkuman() {
    const container = document.getElementById('summary-container');
    if (!container) return;

    // CORS Check
    if (window.location.protocol === 'file:') {
        container.innerHTML = `
            <div class="info-box warning-box" style="text-align: center;">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> Fitur Tidak Berjalan di Mode File</h3>
                <p>Browser memblokir fitur "Auto Sync" karena keamanan (CORS Policy) saat dibuka langsung dari file.</p>
                <p><strong>Solusi:</strong> Silakan jalankan website ini menggunakan <strong>Local Server</strong> (Misal: Live Server di VS Code).</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '<p class="text-center">Memuat rangkuman...</p>';

    // Clear loading text
    let contentHTML = '';

    for (const item of indicators) {
        const doc = await fetchIndicator(item.file);
        if (doc) {
            // Extract Title from Hero
            const titleElement = doc.querySelector('.hero-content h1');
            const title = titleElement ? titleElement.innerText : 'Indikator';

            // Extract Conclusion Box (The Summary)
            // We look for .info-box.success-box specifically
            const conclusionBox = doc.querySelector('.info-box.success-box');
            let summaryContent = '<p>Konten rangkuman tidak tersedia.</p>';

            if (conclusionBox) {
                // Return innerHTML to preserve formatting like <p>, <h3>
                // But we strip the specific "Kesimpulan" header if strictly needed,
                // though usually it's fine to keep it.
                summaryContent = conclusionBox.innerHTML;
            } else {
                // Fallback: Try to grab the first p.lead-text
                const lead = doc.querySelector('.lead-text');
                if (lead) summaryContent = lead.outerHTML;
            }

            // Create Card HTML
            contentHTML += `
            <article class="learning-card fade-in-up delay-1">
                <div class="card-header">
                    <i class="fa-solid ${item.icon}"></i>
                    <h2>${title}</h2>
                </div>
                <div class="card-body">
                    ${summaryContent}
                    <div class="mt-3 text-right">
                        <a href="${item.file}" class="btn-text-small">
                            Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
            `;
        }
    }

    container.innerHTML = contentHTML;
}

// Run on load
document.addEventListener('DOMContentLoaded', loadRangkuman);
