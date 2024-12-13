// helper functions to toggle dark mode
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
}

// determines a new users dark mode preferences
function detectColorScheme() {
    let theme = 'light';

    // check localStorage for a saved 'theme' variable. if it's there, apply the saved theme
    if (localStorage.getItem('theme')) {
        theme = localStorage.getItem('theme');
    }
    // if not found, use the browser preference if available
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }

    theme === 'dark' ? enableDarkMode() : disableDarkMode();
}

// run on page load
detectColorScheme();

// add event listener to the dark mode button toggle
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    localStorage.getItem('theme') === 'light' ? enableDarkMode() : disableDarkMode();
});
