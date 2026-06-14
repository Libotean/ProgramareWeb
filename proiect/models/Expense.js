const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categorie: { type: String, required: true },
    alocat: { type: Number, required: true },
    cheltuit: { type: Number, required: true },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);