const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categorie: { type: String, required: true },
    alocat: { type: Number, required: true },
    tip: { type: String, enum: ['fix', 'variabil'], default: 'variabil' }
});

module.exports = mongoose.model('Budget', budgetSchema);