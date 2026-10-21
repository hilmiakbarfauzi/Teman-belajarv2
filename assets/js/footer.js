document.addEventListener("DOMContentLoaded", function () {
    // 1. Determine Base Path
    const pathName = window.location.pathname;
    const isPages = pathName.includes('/pages/') || pathName.includes('\\pages\\');
    const rootPath = isPages ? '../' : '';

    // 2. Inject CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${rootPath}assets/css/footer.css`;
    document.head.appendChild(link);

    // 3. Inject HTML
    const footerHTML = `
        <footer class="sticky-footer">
            <div class="sticky-footer-content">
                <p>&copy; 2025 Teman Belajar • Dikembangkan oleh Hilmy Akbar Fauzi</p>
            </div>
        </footer>
    `;

    // Append to body
    const footerPlaceholder = document.createElement('div');
    footerPlaceholder.innerHTML = footerHTML;
    document.body.appendChild(footerPlaceholder.firstElementChild);

    // 4. Adjust Body Padding (Already in CSS, but fallback here if needed)
    document.body.style.paddingBottom = "60px";
});