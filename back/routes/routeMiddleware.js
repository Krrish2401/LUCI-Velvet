const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if(!token){
        return res.status(401).json({error: "Unauthorized user!"});
    }

    try{
        const decoded = jwt.verify(token, SECRET_KEY);

        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
            res.clearCookie('authToken');
            return res.status(401).json({ error: "Token expired" });
        }

        req.user = decoded;
        next();
    }
    catch (error){
        return res.status(401).json({error: "Unauthorized  user!"});
    }
};

module.exports = verifyToken;