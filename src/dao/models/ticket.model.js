import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  // Cambiado a String para guardar el correo del usuario tal como solicita la consigna
  purchaser: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Ticket', ticketSchema);
