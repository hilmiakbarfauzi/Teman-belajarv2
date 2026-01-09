const semesterData = {
    'ganjil': [
        { name: 'Pertemuan 1', url: "javascript:handlePertemuan('indikator1.html')" },
        { name: 'Pertemuan 2', url: '#' },
        { name: 'Pertemuan 3', url: '#' },
        { name: 'Pertemuan 4', url: '#' },
        { name: 'Pertemuan 5', url: '#' },
        { name: 'Pertemuan 6', url: '#' },
        { name: 'Pertemuan 7', url: '#' },
        { name: 'Pertemuan 8', url: '#' }
    ],
    'genap': [
        { name: 'Pertemuan 9', url: '#' },
        { name: 'Pertemuan 10', url: '#' },
        { name: 'Pertemuan 11', url: '#' },
        { name: 'Pertemuan 12', url: '#' },
        { name: 'Pertemuan 13', url: '#' },
        { name: 'Pertemuan 14', url: '#' },
        { name: 'Pertemuan 15', url: '#' },
        { name: 'Pertemuan 16', url: '#' }
    ]
};

document.getElementById('ganjil-btn').addEventListener('click', function () {
    updatePertemuan('Semester Ganjil', 'ganjil');
});

document.getElementById('genap-btn').addEventListener('click', function () {
    updatePertemuan('Semester Genap', 'genap');
});

function updatePertemuan(titleText, semesterKey) {
    const container = document.getElementById('pertemuan-container');
    const placeholder = document.getElementById('instruction-placeholder');

    // 1. Hide Placeholder if visible
    if (placeholder && placeholder.style.display !== 'none') {
        placeholder.style.display = 'none';
        placeholder.classList.remove('show');
    }

    // 2. Logic to Switch Content
    // Function to render HTML
    const renderContent = () => {
        const listItems = semesterData[semesterKey].map(item => `
            <a href="${item.url}" class="pertemuan-link">${item.name}</a>
        `).join('');

        container.innerHTML = `
            <h3 id="semester-title">${titleText}</h3>
            <div class="pertemuan-list">
                ${listItems}
            </div>
        `;
    };

    // If container is already visible, fade OUT first
    if (container.classList.contains('show')) {
        container.classList.remove('show');
        container.classList.add('hide'); // Add exit animation class

        setTimeout(() => {
            renderContent();
            container.classList.remove('hide');
            // Force reflow
            void container.offsetWidth;
            container.classList.add('show');
        }, 400); // Wait for transition duration (0.4s)

    } else {
        // First time load
        renderContent();
        container.style.display = 'block'; // Ensure block before fading in

        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
            container.classList.add('show');
        }, 50);
    }
}