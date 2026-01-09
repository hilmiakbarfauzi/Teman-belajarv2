// 0. Determine Base Path
const pathName = window.location.pathname;
const isPages = pathName.includes('/pages/') || pathName.includes('\\pages\\');
const rootPath = isPages ? '../' : '';

// 1. Inject Navbar HTML
const navbarHTML = `
    <div class="navbar">
        <div class="navbar-brand">Teman Belajar</div>
        <div class="hamburger" id="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="navbar-links" id="navbar-links">
            <a href="${rootPath}pages/home.html" id="nav-home">Home</a>
            <a href="${rootPath}pages/profil-sekolah.html" id="nav-profil">Profil Sekolah</a>
            <a href="${rootPath}pages/kelas.html" id="nav-kelas">Kelas</a>
            <a href="${rootPath}pages/pengembang.html" id="nav-dev">Pengembang</a>
            <a href="${rootPath}index.html" id="nav-auth-link">Login</a>
        </div>
    </div>
    `;

// Insert navbar at the top of the body
const navPlaceholder = document.createElement('div');
navPlaceholder.innerHTML = navbarHTML;
document.body.insertBefore(navPlaceholder.firstElementChild, document.body.firstChild);

// Toggle Mobile Menu
const hamburger = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('navbar-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('open');
    });
}

// 2. Highlight Active Link
const page = pathName.split("/").pop() || 'home.html';

function setActive(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.borderBottom = "3px solid white";
        el.style.paddingBottom = "5px";
    }
}

if (page.includes('home')) {
    setActive('nav-home');
} else if (page.includes('profil')) {
    setActive('nav-profil');
} else if (page.includes('kelas') || page.includes('sertifikat') || page.includes('peringkat') || page.includes('quiz')) {
    setActive('nav-kelas');
} else if (page.includes('slider')) {
    setActive('nav-dev');
}

// 3. Handle Auth State (Login/Logout)
// We rely on the existing Firebase instance if available, or localStorage for UI speed
const authLink = document.getElementById('nav-auth-link');

function updateAuthUI(user) {
    if (!authLink) return; // Prevent null error if navbar not ready

    if (user) {
        authLink.textContent = "Logout";
        authLink.href = "#";
        authLink.onclick = (e) => {
            e.preventDefault();
            // Logout logic
            if (window.firebase && window.firebase.auth) {
                window.firebase.auth().signOut().then(() => {
                    localStorage.removeItem('isLoggedIn');
                    window.location.href = `${rootPath}index.html`;
                });
            } else {
                // Fallback
                localStorage.removeItem('isLoggedIn');
                window.location.href = `${rootPath}index.html`;
            }
        };
    } else {
        authLink.textContent = "Login";
        authLink.href = `${rootPath}index.html`;
        authLink.onclick = null;
    }
}

// Check LocalStorage first for immediate UI update (prevents flickering)
if (localStorage.getItem('isLoggedIn') === 'true') {
    updateAuthUI(true);
}

// 4. Handle Restricted Links (Intercept Clicks)
const restrictedLinks = ['nav-kelas']; // IDs of restricted links

function closeMobileMenu() {
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
    if (hamburger && hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
    }
}

function handleRestrictedLink(event) {
    // Cek status login dari localStorage untuk respons instan
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        event.preventDefault(); // Stop navigation

        closeMobileMenu(); // Force Close Menu First

        if (typeof showAlert === 'function') {
            setTimeout(() => {
                showAlert("Akses Dibatasi", "Silakan login terlebih dahulu untuk mengakses halaman ini.", `${rootPath}index.html`);
            }, 300); // Small delay for smooth closing animation
        } else {
            alert("Akses Dibatasi. Silakan login.");
            window.location.href = `${rootPath}index.html`;
        }
    }
}

// Attach listeners to restricted links
restrictedLinks.forEach(id => {
    const link = document.getElementById(id);
    if (link) {
        link.addEventListener('click', handleRestrictedLink);
    }
});

// Check Firebase Auth State (if Firebase is loaded)
// We use a small timeout to let Firebase SDK load if it's included in the head
setTimeout(() => {
    if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged((user) => {
            updateAuthUI(user);
            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                // Remove interception if logged in (optional, logic inside handler covers it)
            } else {
                localStorage.removeItem('isLoggedIn');
            }
        });
    }
}, 500);
