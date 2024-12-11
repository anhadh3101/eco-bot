function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
}

function disableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
}

function updateDarkModeButton() {
    const darkModeToggleBtn = document.getElementById('dark-mode-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        darkModeToggleBtn.textContent = '🌞';
    } else {
        darkModeToggleBtn.textContent = '🌙';
    }
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'light' || !localStorage.getItem('theme')) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    updateDarkModeButton();

    // If map.js has applyTheme function, call it:
    if (typeof applyTheme === 'function') {
        applyTheme();
    }

    // If a route is selected, update it to reflect info window styling
    if (typeof selectedRecyclingCenter !== 'undefined' && selectedRecyclingCenter) {
        updateRoute();
    }
}

function detectColorScheme() {
    let theme = 'light';

    if (localStorage.getItem('theme')) {
        theme = localStorage.getItem('theme');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }

    if (theme === 'dark') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    updateDarkModeButton();
}

// On page load
detectColorScheme();

// Add event listener to the dark mode button toggle
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    toggleTheme();
});
