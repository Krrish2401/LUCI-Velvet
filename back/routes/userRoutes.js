const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const verifyToken = require('./routeMiddleware');

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.use(cookieParser());

router.post('/register', limiter, [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error registering user' });
            } else {
                res.status(201).json('User registered');
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

router.post('/login', limiter, [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error logging in' });
            } else if (row) {
                bcrypt.compare(password, row.password, (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: 'Error logging in' });
                    } else if (result) {
                        const token = jwt.sign({username : row.username , id: row.id}, SECRET_KEY, {expiresIn: '1h'});
                        res.cookie('authToken', token,{
                            sameSite: 'none',
                            secure: true,
                            maxAge: 3600000
                        });
                        res.status(200).json('User logged in');
                    } else {
                        res.status(401).json('Incorrect password');
                    }
                });
            } else {
                res.status(401).json('Invalid username');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.get('/check-auth', verifyToken, (req, res) => {
    res.status(200).json({ authenticated: true });
});

module.exports = router;