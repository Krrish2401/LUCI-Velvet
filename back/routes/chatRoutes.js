const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const dotenv = require('dotenv').config();
const Sentiment = require('sentiment');
const db = require("../db");
const verifyToken = require("./routeMiddleware");

const sentiment = new Sentiment();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/message', verifyToken, async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ error: 'User message is required' });
        }

        const lowerCaseMessage = message.toLowerCase();

        const userSentiment = sentiment.analyze(message);

        let systemContent = `
You are Velvet, an intelligent and witty AI assistant developed by Krrish — an engineering student and developer. 
You have a conversational tone with light humor and subtle sarcasm *only when appropriate* — never at the cost of clarity or usefulness.

- Do NOT include your name or mention your creator unless directly asked.
- Keep responses concise and to the point. Only elaborate when the question requires explanation.
- Use a professional, friendly, and supportive tone — especially when the user is frustrated or upset.
- Use wit or light sarcasm sparingly, and ONLY when the context clearly allows for it (e.g., during casual small talk, jokes, or when the user initiates a fun tone).
- Never repeat your identity, name, or origin unless explicitly asked.

Only introduce yourself at the start of a new session if the user has not interacted before. Focus on helping efficiently and respectfully.
`;


        if (userSentiment.score < -2) {
            systemContent = "You are Velvet, a professional assistant with a friendly tone. If the user seems sad or frustrated, respond with kindness and encouragement while keeping your usual wit.";
        }

        let convoId = conversationId;
        if(!convoId){
            await new Promise((resolve, reject)=>{
                const defaultTitle = message.length > 30 ? message.slice(0,30) + '...' : message;
                db.run(`INSERT INTO conversations (user_id ,title) VALUES (?,?)`,
                    [userId, defaultTitle],
                    function (err){
                        if (err) return reject(err);
                        convoId =this.lastID;
                        resolve();
                    }
                );
            });
        }

        const history = await new Promise((resolve, reject) => {
            db.all(
                'SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
                [convoId],
                (err,rows)=>{
                    if(err) return reject(err);
                    const formatted = rows.map(row=>({
                        role: row.sender === 'user' ? 'user' : 'assistant',
                        content: row.content
                    }));
                    resolve(formatted);
                }
            )
        })

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO messages (conversation_id, sender, content) VALUES (?, ?, ?)',
                [convoId, 'user', message],
                (err)=> (err ? reject(err):resolve())
            );
        });

        async function getGroqChatStream() {
            const messages = [
                { role: "system", content: systemContent },
                ...history,
                { role: 'user', content: message }
            ];
            return groq.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_completion_tokens: 1024,
                top_p: 1,
                stop: null,
                stream: true,
            });
        }

        const stream = await getGroqChatStream();
        let responseContent = '';
        for await (const chunk of stream) {
            responseContent += chunk.choices[0]?.delta?.content || "";
        }
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO messages (conversation_id, sender, content) VALUES (?, ?, ?)',
                [convoId, 'assistant', responseContent],
                (err) => (err ? reject(err) : resolve())
            );
        });
        res.json({ response: responseContent, conversationId: convoId });
    } catch (error) {
        console.error('Error sending message to Groq:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});

router.get('/chats', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        db.all(
            `
            SELECT c.id AS conversationId, c.title, MAX(m.timestamp) AS last_updated
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY last_updated DESC
            `,
            [userId],
            (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ chats: rows });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


router.get('/chat/:id', verifyToken, async (req, res) => {
    const convoId = req.params.id;
    const userId = req.user.id;

    try {
        db.all(
            `
            SELECT m.sender, m.content, m.timestamp 
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.conversation_id = ? AND c.user_id = ?
            ORDER BY m.timestamp ASC
            `,
            [convoId, userId],
            (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ messages: rows });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.put('/rename/:id',verifyToken,(req,res)=>{
    const convoId=req.params.id;
    const userId = req.user.id;
    const {title} = req.body;

    if(!title) return res.status(400).json({error: 'Title is required'});

    db.run(
        'UPDATE conversations SET title = ? WHERE id = ? AND user_id = ?',
        [title, convoId, userId],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        }
    );
})

router.delete('/delete/:id', verifyToken,(req,res)=>{
    const userId = req.user.id;
    const convoId = req.params.id;

    db.serialize(()=>{
        db.run(
            'DELETE FROM messages WHERE conversation_id = ?',
            [convoId],
            (err) => {
                if (err) return res.status(500).json({error: 'Failed to delete conversation'});

                db.run(
                    'DELETE FROM conversations WHERE id = ? AND user_id = ?',
                    [convoId, userId],
                    (err2) => {
                        if (err2) return res.status(500).json({ error: 'Failed to delete conversation' });
                        res.json({ success: true });
                    }
                );
            }
        )
    })
})

module.exports = router;
