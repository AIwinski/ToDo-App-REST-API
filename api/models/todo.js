const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: Date,
    text: String,
    completed: Boolean,
    author: String
});

module.exports = mongoose.model('TODO', todoSchema); 