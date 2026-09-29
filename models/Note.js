import { Schema, model } from 'mongoose';

// This is the model you will be modifying
const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Note = model('Note', noteSchema);

export default Note;