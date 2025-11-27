// === SISTEMA DE AVALIAÇÕES ===

// Estrutura de dados:
// {
//   "movieId": {
//     "ratings": [
//       { "userId": "user123", "rating": 4.5, "comment": "Ótimo filme!", "date": "2024-11-26" }
//     ],
//     "averageRating": 4.5,
//     "totalRatings": 1
//   }
// }

class RatingSystem {
    constructor() {
        this.storageKey = 'combflix_ratings';
        this.userKey = 'combflix_user_id';
        this.userId = this.getUserId();
    }

    // Gera ou recupera ID do usuário
    getUserId() {
        let userId = localStorage.getItem(this.userKey);
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.userKey, userId);
        }
        return userId;
    }

    // Recupera todas as avaliações
    getAllRatings() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // Salva todas as avaliações
    saveAllRatings(ratings) {
        localStorage.setItem(this.storageKey, JSON.stringify(ratings));
    }

    // Recupera avaliações de um filme específico
    getMovieRatings(movieId) {
        const allRatings = this.getAllRatings();
        return allRatings[movieId] || {
            ratings: [],
            averageRating: 0,
            totalRatings: 0
        };
    }

    // Adiciona ou atualiza avaliação
    addRating(movieId, rating, comment = '') {
        const allRatings = this.getAllRatings();
        
        if (!allRatings[movieId]) {
            allRatings[movieId] = {
                ratings: [],
                averageRating: 0,
                totalRatings: 0
            };
        }

        const movieData = allRatings[movieId];
        
        // Verifica se o usuário já avaliou este filme
        const existingIndex = movieData.ratings.findIndex(r => r.userId === this.userId);
        
        const newRating = {
            userId: this.userId,
            rating: rating,
            comment: comment,
            date: new Date().toISOString().split('T')[0],
            userName: this.generateUserName()
        };

        if (existingIndex >= 0) {
            // Atualiza avaliação existente
            movieData.ratings[existingIndex] = newRating;
        } else {
            // Adiciona nova avaliação
            movieData.ratings.push(newRating);
        }

        // Recalcula média
        this.recalculateAverage(movieData);
        
        // Salva
        this.saveAllRatings(allRatings);
        
        return movieData;
    }

    // Recalcula média de avaliações
    recalculateAverage(movieData) {
        const total = movieData.ratings.length;
        if (total === 0) {
            movieData.averageRating = 0;
            movieData.totalRatings = 0;
            return;
        }

        const sum = movieData.ratings.reduce((acc, r) => acc + r.rating, 0);
        movieData.averageRating = parseFloat((sum / total).toFixed(1));
        movieData.totalRatings = total;
    }

    // Verifica se o usuário já avaliou um filme
    hasUserRated(movieId) {
        const movieData = this.getMovieRatings(movieId);
        return movieData.ratings.some(r => r.userId === this.userId);
    }

    // Recupera avaliação do usuário para um filme
    getUserRating(movieId) {
        const movieData = this.getMovieRatings(movieId);
        return movieData.ratings.find(r => r.userId === this.userId);
    }

    // Gera nome de usuário anônimo
    generateUserName() {
        const adjectives = ['Cinéfilo', 'Crítico', 'Espectador', 'Fã', 'Admirador'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNum = Math.floor(Math.random() * 999) + 1;
        return `${randomAdj} #${randomNum}`;
    }

    // Remove avaliação do usuário
    removeUserRating(movieId) {
        const allRatings = this.getAllRatings();
        
        if (!allRatings[movieId]) {
            return false;
        }

        const movieData = allRatings[movieId];
        const initialLength = movieData.ratings.length;
        
        movieData.ratings = movieData.ratings.filter(r => r.userId !== this.userId);
        
        if (movieData.ratings.length < initialLength) {
            this.recalculateAverage(movieData);
            this.saveAllRatings(allRatings);
            return true;
        }
        
        return false;
    }

    // Gera avaliações de exemplo para demonstração
    generateSampleRatings(movieId, count = 5) {
        const comments = [
            'Filme incrível! Recomendo muito!',
            'Adorei a história e os personagens.',
            'Efeitos visuais espetaculares.',
            'Um clássico que vale a pena assistir.',
            'Ótima produção, muito bem feito.',
            'Surpreendente do início ao fim.',
            'Não é o melhor, mas vale a pena.',
            'Esperava mais, mas ainda é bom.',
            'Excelente trilha sonora!',
            'Atuações impecáveis.'
        ];

        const allRatings = this.getAllRatings();
        
        if (!allRatings[movieId]) {
            allRatings[movieId] = {
                ratings: [],
                averageRating: 0,
                totalRatings: 0
            };
        }

        const movieData = allRatings[movieId];

        // Gera avaliações aleatórias
        for (let i = 0; i < count; i++) {
            const fakeUserId = 'sample_user_' + i + '_' + movieId;
            
            // Verifica se já existe
            if (movieData.ratings.some(r => r.userId === fakeUserId)) {
                continue;
            }

            const rating = {
                userId: fakeUserId,
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Entre 3.0 e 5.0
                comment: comments[Math.floor(Math.random() * comments.length)],
                date: this.getRandomDate(),
                userName: this.generateUserName()
            };

            movieData.ratings.push(rating);
        }

        this.recalculateAverage(movieData);
        this.saveAllRatings(allRatings);
        
        return movieData;
    }

    // Gera data aleatória recente
    getRandomDate() {
        const today = new Date();
        const daysAgo = Math.floor(Math.random() * 30); // Últimos 30 dias
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }
}

// Exporta instância global
const ratingSystem = new RatingSystem();
