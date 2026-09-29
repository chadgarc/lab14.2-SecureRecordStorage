import { Router } from 'express';
import User from '../../models/User.js';
import auth from '../../utils/auth.js';
const { signToken } = auth;

const router = Router();

// POST /api/users/register - Create a new user
router.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        const token = signToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        console.error('Registration error:', err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        // Handle duplicate key errors (email/username already exists)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }
        res.status(400).json({ message: err.message || 'Registration failed' });
    }
});

// POST /api/users/login - Authenticate a user and return a token
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
    }
    
    const correctPw = await user.isCorrectPassword(req.body.password);
    
    if (!correctPw) {
        return res.status(400).json({ message: 'Wrong password!' });
    }
    
    const token = signToken(user);
    res.json({ token, user });
});

export default router;