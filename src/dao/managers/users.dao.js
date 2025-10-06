import User from '../models/user.model.js';

export default class UsersDAO {
  async getAll() {
    return await User.find().lean();
  }

  async getById(id) {
    return await User.findById(id).lean();
  }

  // Nuevo método requerido por repositorios / servicios
  async getByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  async create(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}
