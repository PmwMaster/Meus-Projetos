// === CONFIGURAÇÃO TMDB ===
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YWU1MmZiNDIzNjNlYWNiOTkwZDk5ZTdiMmY3YTY2OSIsIm5iZiI6MTc2NDE2MTc5OC44MjYsInN1YiI6IjY5MjZmOTA2MjdlZGQxYjVjYTI0NTAxNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3nL7NjJeHKXYy8ThVXxG3JYcj-QjeHxgCK-TPH_5bI8";

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
};

const moviesGrid = document.getElementById("movies");
const searchInput = document.getElementById("searchInput");
const genreButtons = document.querySelectorAll(".genre-btn");
const noResults = document.getElementById("noResults");

let genresMap = {};
let allMovies = [];
let currentMovie = null;
let selectedRating = 0;

// === CARREGA GÊNEROS ===
async function loadGenres() {
    try {
        const url = "https://api.themoviedb.org/3/genre/movie/list?language=pt-BR";
        const res = await fetch(url, API_OPTIONS);
        const data = await res.json();

        data.genres.forEach(g => {
            genresMap[g.id] = g.name;
        });
    } catch (error) {
        console.error("Erro ao carregar gêneros:", error);
    }
}

// === BUSCA FILMES POPULARES ===
async function loadMovies() {
    try {
        const url = "https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1";
        const res = await fetch(url, API_OPTIONS);
        const data = await res.json();

        allMovies = data.results.map(movie => ({
            ...movie,
            price: definePreco()
        }));

        renderMovies(allMovies);
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        moviesGrid.innerHTML = "<p style='text-align:center;color:#999;'>Erro ao carregar filmes. Verifique sua conexão.</p>";
    }
}

// === PREÇO ALEATÓRIO ===
function definePreco() {
    const precos = [4.90, 7.90, 9.90, 12.90];
    return precos[Math.floor(Math.random() * precos.length)];
}

// === RENDERIZA FILMES ===
function renderMovies(list) {
    moviesGrid.innerHTML = "";

    if (list.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    list.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.dataset.title = movie.title;
        card.dataset.price = movie.price;

        const imgURL = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x440/333/FFF?text=Sem+Imagem";

        // Obtém avaliação do filme
        const movieRatings = ratingSystem.getMovieRatings(movie.id);
        const ratingHTML = movieRatings.totalRatings > 0 
            ? `<p class="card-rating">★ ${movieRatings.averageRating} (${movieRatings.totalRatings})</p>`
            : '<p class="card-rating">Sem avaliações</p>';

        card.innerHTML = `
            <img src="${imgURL}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            ${ratingHTML}
            <p class="price">R$ ${movie.price.toFixed(2)}</p>
            <button class="btn-details">Ver Detalhes</button>
        `;

        card.querySelector(".btn-details").onclick = () => openModal(movie);

        moviesGrid.appendChild(card);
    });
}

// === BUSCA ===
searchInput.addEventListener("input", () => {
    const texto = searchInput.value.toLowerCase().trim();

    if (texto === "") {
        renderMovies(allMovies);
        return;
    }

    const filtrados = allMovies.filter(m =>
        m.title.toLowerCase().includes(texto)
    );

    renderMovies(filtrados);
});

// === FILTRO POR BOTÕES DE GÊNERO ===
genreButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const activeBtn = document.querySelector(".genre-btn.active");
        if (activeBtn) activeBtn.classList.remove("active");
        btn.classList.add("active");

        const genreName = btn.dataset.genre.toLowerCase();

        if (genreName === "todos") {
            renderMovies(allMovies);
            return;
        }

        const filtrados = allMovies.filter(movie =>
            movie.genre_ids.some(id => {
                const genreNameFromMap = genresMap[id]?.toLowerCase();
                return genreNameFromMap && genreNameFromMap.includes(genreName);
            })
        );

        renderMovies(filtrados);
    });
});

// === SISTEMA DE AVALIAÇÕES ===
function updateAverageRating(movieId) {
    const movieRatings = ratingSystem.getMovieRatings(movieId);
    const avgRatingEl = document.getElementById('averageRating');
    const starsDisplay = avgRatingEl.querySelector('.stars-display');
    const ratingText = avgRatingEl.querySelector('.rating-text');

    if (movieRatings.totalRatings > 0) {
        starsDisplay.innerHTML = generateStarsHTML(movieRatings.averageRating);
        ratingText.textContent = `${movieRatings.averageRating} de 5 (${movieRatings.totalRatings} avaliações)`;
        avgRatingEl.style.display = 'block';
    } else {
        avgRatingEl.style.display = 'none';
    }
}

function generateStarsHTML(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        html += '★';
    }
    if (hasHalfStar) {
        html += '½';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        html += '☆';
    }
    return html;
}

function loadRatingsList(movieId) {
    const movieRatings = ratingSystem.getMovieRatings(movieId);
    const container = document.getElementById('ratingsContainer');
    
    if (movieRatings.ratings.length === 0) {
        container.innerHTML = '<div class="no-ratings">Ainda não há avaliações para este filme.</div>';
        return;
    }
    
    // Ordena por data (mais recentes primeiro)
    const sortedRatings = [...movieRatings.ratings].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Mostra apenas as 3 primeiras no modal
    const ratingsToShow = sortedRatings.slice(0, 3);
    
    container.innerHTML = ratingsToShow.map(rating => `
        <div class="rating-item">
            <div class="rating-header">
                <div>
                    <span class="rating-user">${rating.userName || 'Anônimo'}</span>
                    <span class="rating-date"> • ${formatDate(rating.date)}</span>
                </div>
                <span class="rating-stars">${generateStarsHTML(rating.rating)}</span>
            </div>
            ${rating.comment ? `<div class="rating-comment">${rating.comment}</div>` : ''}
        </div>
    `).join('');
    
    // Adiciona mensagem se houver mais avaliações
    if (sortedRatings.length > 3) {
        container.innerHTML += `<div style="text-align: center; margin-top: 12px; color: var(--text-muted); font-size: 0.9em;">
            + ${sortedRatings.length - 3} avaliações. Clique em "Ver todas" para ver mais.
        </div>`;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    
    return date.toLocaleDateString('pt-BR');
}

function initializeRatingForm(movieId) {
    const starsInput = document.querySelectorAll('#starsInput .star');
    const submitBtn = document.getElementById('submitRating');
    const commentInput = document.getElementById('ratingComment');
    
    // Reset
    selectedRating = 0;
    commentInput.value = '';
    starsInput.forEach(star => star.classList.remove('active'));
    
    // Verifica se usuário já avaliou
    const userRating = ratingSystem.getUserRating(movieId);
    if (userRating) {
        selectedRating = userRating.rating;
        commentInput.value = userRating.comment || '';
        updateStarsDisplay(selectedRating);
        submitBtn.textContent = 'Atualizar Avaliação';
    } else {
        submitBtn.textContent = 'Enviar Avaliação';
    }
    
    // Event listeners para estrelas
    starsInput.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStarsDisplay(selectedRating);
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            updateStarsDisplay(rating, true);
        });
    });
    
    document.getElementById('starsInput').addEventListener('mouseleave', () => {
        updateStarsDisplay(selectedRating);
    });
    
    // Submit
    submitBtn.onclick = () => {
        if (selectedRating === 0) {
            alert('Por favor, selecione uma classificação de estrelas.');
            return;
        }
        
        const comment = commentInput.value.trim();
        ratingSystem.addRating(movieId, selectedRating, comment);
        
        // Atualiza interface
        updateAverageRating(movieId);
        loadRatingsList(movieId);
        
        // Feedback
        submitBtn.textContent = userRating ? 'Avaliação Atualizada!' : 'Avaliação Enviada!';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Atualizar Avaliação';
            submitBtn.disabled = false;
        }, 2000);
    };
}

function updateStarsDisplay(rating, isHover = false) {
    const stars = document.querySelectorAll('#starsInput .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// === MODAL ===
function openModal(movie) {
    currentMovie = movie;

    const modal = document.getElementById("movieModal");
    const title = document.getElementById("modalTitle");
    const desc = document.getElementById("modalDesc");
    const img = document.getElementById("modalImage");
    const price = document.getElementById("modalPrice");

    title.textContent = movie.title;
    desc.textContent = movie.overview || "Sem descrição disponível.";
    price.textContent = `R$ ${movie.price.toFixed(2)}`;

    img.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/300x440/333/FFF?text=Sem+Imagem";

    modal.style.display = "flex";

    // Gera avaliações de exemplo se não existirem
    const movieRatings = ratingSystem.getMovieRatings(movie.id);
    if (movieRatings.totalRatings === 0) {
        ratingSystem.generateSampleRatings(movie.id, Math.floor(Math.random() * 8) + 3);
    }

    // Atualiza interface de avaliações
    updateAverageRating(movie.id);
    loadRatingsList(movie.id);
    initializeRatingForm(movie.id);

    // FECHAR
    const closeBtn = document.querySelector(".close");
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };

    // Fechar ao clicar fora do modal
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    };

    // PAGAMENTO
    const rentBtn = document.getElementById("rentNow");
    rentBtn.onclick = () => {
        const movieId = movie.id;
        const movieTitle = movie.title;
        const moviePrice = movie.price;
        const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x440/333/FFF?text=Sem+Imagem";

        window.location.href = `payment.html?id=${movieId}&title=${encodeURIComponent(movieTitle)}&price=${moviePrice}&poster=${encodeURIComponent(posterPath)}`;
    };

    // VER TODAS AS AVALIAÇÕES
    const viewAllBtn = document.getElementById("viewAllReviews");
    viewAllBtn.onclick = () => {
        const movieId = movie.id;
        const movieTitle = movie.title;
        const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x440/333/FFF?text=Sem+Imagem";

        window.location.href = `reviews.html?id=${movieId}&title=${encodeURIComponent(movieTitle)}&poster=${encodeURIComponent(posterPath)}`;
    };
}

// === INICIALIZA ===
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    await loadMovies();
});
