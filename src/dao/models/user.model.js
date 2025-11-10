import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;