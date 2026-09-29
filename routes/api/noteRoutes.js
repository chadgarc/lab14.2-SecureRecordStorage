import { Router } from 'express';
import Note from '../../models/Note.js';
import auth from '../../utils/auth.js';
const { authMiddleware } = auth;

const router = Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// GET /api/notes - Get all notes for the logged-in user
router.get('/', async (req, res) => {
    // Only return notes where the user field matches the authenticated user's ID
    try {
        const notes = await Note.find({ user: req.user._id });
        res.json(notes);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
    try {
        const note = await Note.create({
            ...req.body,
            // Associate the note with the currently authenticated user
            user: req.user._id,
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(400).json(err);
    }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
    try {
        // First, find the note to check ownership
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'No note found with this id!' });
        }

        // Check if the authenticated user owns this note
        // Convert both to strings for safe comparison (ObjectId vs string)
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User is not authorized to update this note.' });
        }

        // Owner confirmed - proceed with update
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
    try {
        // First, find the note to check ownership
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'No note found with this id!' });
        }

        // Check if the authenticated user owns this note
        // Convert both to strings for safe comparison (ObjectId vs string)
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User is not authorized to delete this note.' });
        }

        // Owner confirmed - proceed with deletion
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted!' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET /api/notes/:id - Get a single note (with ownership check)
router.get('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'No note found with this id!' });
        }

        // Check ownership
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User is not authorized to view this note.' });
        }

        res.json(note);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;