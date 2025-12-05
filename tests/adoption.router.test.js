import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

const exampleUserId = new mongoose.Types.ObjectId();
const examplePetId = new mongoose.Types.ObjectId();

let createdAdoptionId;

describe("Adoption Router Functional Tests", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("debe crear una nueva solicitud de adopción (POST /api/adoption)", async () => {
    const res = await request(app)
      .post("/api/adoption")
      .send({
        userId: exampleUserId,
        petId: examplePetId,
        comments: "Quiero adoptar a este perrito",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    createdAdoptionId = res.body._id;
  });

  it("debe listar todas las adopciones (GET /api/adoption)", async () => {
    const res = await request(app).get("/api/adoption");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe obtener una adopción por ID (GET /api/adoption/:id)", async () => {
    const res = await request(app).get(`/api/adoption/${createdAdoptionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", createdAdoptionId);
  });

  it("debe dar 404 si la adopción no existe (GET /api/adoption/:id)", async () => {
    const res = await request(app).get(`/api/adoption/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
  });

  it("debe actualizar una solicitud de adopción (PUT /api/adoption/:id)", async () => {
    const res = await request(app)
      .put(`/api/adoption/${createdAdoptionId}`)
      .send({ status: "approved" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "approved");
  });

  it("debe eliminar una solicitud de adopción (DELETE /api/adoption/:id)", async () => {
    const res = await request(app).delete(`/api/adoption/${createdAdoptionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("debe dar 404 al borrar una adopción inexistente", async () => {
    const res = await request(app).delete(`/api/adoption/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
  });
});