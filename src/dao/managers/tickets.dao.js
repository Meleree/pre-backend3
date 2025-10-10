import TicketModel from '../../dao/models/ticket.model.js';

export default class TicketsDAO {
  async getAll() {
    return await TicketModel.find();
  }

  async getById(id) {
    return await TicketModel.findById(id);
  }

  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }
}