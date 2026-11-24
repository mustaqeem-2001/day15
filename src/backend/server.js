import express from "express";
import cors from "cors";
import db from "./database/db.js";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
const PgSession = connectPgSimple(session);

const server = express();
server.use(express.json())

server.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

server.use(session({
    store: new PgSession({
        pool: db,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


server.get("/", async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM users;");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
})

server.get("/users", requireAuth, async (req, res, next) => {
   const user = req.session.userId;
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1;", [user]);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
})

server.post("/users", validation, async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const hashedPassword  = await bcrypt.hash(password, 12); 
        const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at, is_active", [email, hashedPassword ]);
        res.status(201).json(result.rows[0]);
    } catch(err) {
        next(err);
    }
})

server.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }

        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
    });
});

server.post("/login", validation, async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        console.log(result);
        if (result.rows.length === 0) {
            throw new Error("Email does not exist");
        } 
        const hashedPassword = await bcrypt.compare(password, result.rows[0].password);
        console.log(hashedPassword);
        if (!hashedPassword) {
            throw new Error("Password is incorrect");
        }
        req.session.userId = result.rows[0].id;
        res.json({message: "Log in successfull!", email: email, userId: req.session.userId});
    } catch (err) {
        next(err);
    }
})

server.get("/me", requireAuth, async (req, res, next) => {
    res.json({message: "You are still logged in!"})
})

server.put("/users/:id", validation, async (req, res, next) => {
    const id = req.params.id;
    const { email, password } = req.body
    try {
        const result = await db.query("UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING id, email, created_at, is_active", [email, password, id]);
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
})

server.delete("/users/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING id, email, created_at, is_active", [id]);
        res.json(result.rows[0]);
    } catch(err) {
        next(err);
    }
})

function validation(req, res, next) {
    const { email, password } = req.body;
    if (email && email.length < 12) {
        return res.status(400).json({message: "Your email is too short please enter more characters."})
    }
    if (password && password.length < 6) {
        return res.status(400).json({message: "Please enter a valid password containing a minimum of 6 characters"});
    }
    next(); 
}

function requireAuth(req, res, next) {
    console.log("your id is " + req.session.userId);
    if (req.session.userId === undefined || req.session.userId === null) {
        return res.status(401).json({message: "You must log in first to access"});
    }
    next()
}

server.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: err.message
    })
})

server.listen(3000, () => {
    console.log("Express server running");
});