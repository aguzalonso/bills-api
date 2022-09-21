import mongoose from "mongoose";

const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, unique: true },
    password: { type: String },
    bills: { type: Array }
}, { collection: 'user-data' }))

export default User;