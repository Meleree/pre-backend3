import { ticketsDAO } from '../dao/index.js'; 

export default class TicketRepository {
  constructor() {
    this.dao = ticketsDAO;
  }

  async create(ticketData) {
    return await this.dao.create(ticketData);
  }

  async getAll() {
    return await this.dao.getAll();
  }

  async getById(id) {
    return await this.dao.getById(id);
  }
}