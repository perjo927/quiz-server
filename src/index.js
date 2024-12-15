// server/src/index.js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import helmet from 'helmet';

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

// Sample game configuration
const gameConfig = {
    gameID: "1",
    questions: [
        {
            id: 1,
            title: "Vad heter Sveriges huvudstad?",
            image: "sthlm.png",
            answers: [
                { id: "1.A", text: "A. Wien" },
                { id: "1.B", text: "B. Stockholm" },
                { id: "1.C", text: "C. Gerhard Schröder" }
            ]
        },
        {
            id: 2,
            title: "Var bor Agneta och Thomas?",
            image: "oland.png",
            answers: [
                { id: "2.A", text: "A. Öland" },
                { id: "2.B", text: "B. Innsbruck" },
                { id: "2.C", text: "C. Gotland" }
            ]
        }
    ]
};

// Sample answer validation configuration
const validationConfig = {
    "1": {
        questions: [
            { id: "1", answer: "B" },
            { id: "2", answer: "A" },
        ]
    }
};

// Sample high scores
let highScores = [
    { name: "Per", score: 0 },
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
