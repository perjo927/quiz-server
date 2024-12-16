// server/src/index.js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import helmet from 'helmet';
import { gameConfig1, validationConfig1 } from './game1.js';
import { gameConfig2, validationConfig2 } from './game2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const passphrase = "kanelbulle";

const allowedOrigins = [
    'http://localhost:5173',
    'https://quizbattle-au.netlify.app',
    'https://quizbattle-no.netlify.app',
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
    ...gameConfig1,
    ...gameConfig2
};

// Answer validation configuration
const validationConfig = {
    ...validationConfig1,
    ...validationConfig2
};

const highScores = {
    "1": [
        { name: "Angela Merkel", score: 0 }
    ],
    "2": [
        { name: "Per", score: 0 },
    ]
}

// Get game configuration
app.get('/api/game/:gameId', (req, res) => {
    const { gameId } = req.params;

    res.json(gameConfig[gameId]);
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
app.get('/api/highscores/:gameId', (req, res) => {
    const { gameId } = req.params;

    res.json(highScores[gameId].slice(0, 10));
});

// Add new high score
app.post('/api/highscores/:gameId', (req, res) => {
    const { gameId } = req.params;
    const { name, score } = req.body;

    highScores[gameId].push({ name, score });
    highScores[gameId].sort((a, b) => b.score - a.score);

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
