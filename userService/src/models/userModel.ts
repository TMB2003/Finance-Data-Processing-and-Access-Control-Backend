import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'viewer', 'analyst'],
        required: true,
        default: 'viewer'
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
});

export const User = mongoose.model('User', userSchema);
