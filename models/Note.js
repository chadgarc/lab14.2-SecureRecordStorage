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
    // Associate note with its owner
    // type: Schema.Types.ObjectId -> stores a MongoDB ObjectId
    // ref: 'User'                 -> references the User model (enables populate)
    // required: true              -> every note MUST have an owner
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // ------------------------------------------------
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Note = model('Note', noteSchema);

export default Note;