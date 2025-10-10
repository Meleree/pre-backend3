// src/repositories/products.repository.js (CORREGIDO)
import { productsDAO } from '../dao/index.js'; // 🚨 Importar el DAO directamente

class ProductRepository {
  constructor() {
      // Usar el DAO importado
      this.dao = productsDAO; 
  }

  async getAll(filters = {}, options = {}) {
      return await this.dao.getAll(filters, options);
  }
  // ... (otros métodos)
  async getById(id) {
      return await this.dao.getById(id);
  }

  async create(productData) {
      return await this.dao.create(productData);
  }

  async update(id, updateData) {
      // 🚨 Método renombrado para claridad en la actualización de stock
      return await this.dao.update(id, updateData);
  }

  async delete(id) {
      return await this.dao.delete(id);
  }
}

export default ProductRepository;