const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
    descriere: { type: String, required: true },
    suma: { type: Number, required: true },
    luna: { type: Number, required: true },
    an: { type: Number, required: true },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);