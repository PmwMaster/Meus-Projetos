document.addEventListener('DOMContentLoaded', () => {
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const themeSwitch = document.getElementById('themeSwitch');

    // --- Lógica de Tema ---
    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            themeSwitch.checked = true;
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            themeSwitch.checked = false;
            localStorage.setItem('theme', 'dark');
        }
    }

    // Inicialização do Tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        applyTheme(true);
    } else {
        applyTheme(false); // Garante que o tema escuro é o padrão
    }

    // Listener para o Toggle de Tema
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            applyTheme(themeSwitch.checked);
        });
    }

    // --- Lógica do Modal de Configurações ---
    if (settingsIcon && settingsModal) {
        // Abrir Modal
        settingsIcon.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });

        // Fechar Modal pelo X
        closeSettings.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });

        // Fechar Modal clicando fora
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
});
