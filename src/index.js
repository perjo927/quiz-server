// server/src/index.js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import helmet from 'helmet';
import { gameConfig1, validationConfig1 } from './game1.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const passphrase = "kanelbulle";

const allowedOrigins = [
    'http://localhost:5173',
    'https://quizbattle-au.netlify.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Enable if you're using cookies or authentication
    maxAge: 86400  // Cache preflight request results for 24 hours
};

const app = express();
const PORT = 3000;

app.use(cors(corsOptions));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.json());

// Game configuration
const gameConfig = {
    ...gameConfig1
};

// Answer validation configuration
const validationConfig = {
    ...validationConfig1
};

// High scores
let highScores = [
    { name: "Angela Merkel", score: 0 },
];

// Get game configuration
app.get('/api/game/:gameId', (req, res) => {
    res.json(gameConfig);
});

// Validate answer
app.post('/api/validate/:gameId/question/:questionId', (req, res) => {
    const { gameId, questionId } = req.params;
    const { answer } = req.body;

    const question = validationConfig[gameId]
        .questions
        .find(q => q.id === questionId);

    const isCorrect = question && question.answer === answer;

    res.json({ correct: isCorrect });
});

// Get high scores
app.get('/api/highscores', (req, res) => {
    res.json(highScores.slice(0, 10));
});

// Add new high score
app.post('/api/highscores', (req, res) => {
    const { name, score } = req.body;
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    res.json({ success: true });
});

app.post("/api/login", (req, res) => {
    const { password } = req.body;

    console.log(passphrase, password, password === passphrase)
    res.json({ success: password === passphrase });
})

app.use(express.static('public'), express.static(path.join(__dirname, '../public')))

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
