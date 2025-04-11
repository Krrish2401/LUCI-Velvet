const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Add this line to parse cookies

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

app.listen(port, "0.0.0.0", () => {
    console.log('Server is listening on port', port);
});
