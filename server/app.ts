import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { ownerEmails, requireAccess, requireAuth, requireOwner } from "./auth.js";
import { Collaborator, type CollaboratorStatus } from "./collaborator.js";
import { connectDatabase } from "./db.js";
import { Product, type ProductInput } from "./product.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", async (_req, res) => {
  await connectDatabase();
  res.json({ ok: true });
});

app.get("/api/products", async (req, res) => {
  await connectDatabase();
  const products = await Product.find({ active: true }).sort({ createdAt: 1 }).lean();
  res.json(products);
});

app.get("/api/access-status", requireAuth, async (_req, res) => {
  await connectDatabase();
  const user = res.locals.user;
  if (ownerEmails.has(user.email)) return res.json({ status: "approved", owner: true });
  const collaborator = await Collaborator.findOneAndUpdate(
    { uid: user.uid },
    { $setOnInsert: { uid: user.uid, email: user.email, name: user.name || "", photo: user.picture || "", status: "pending" } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  res.json({ status: collaborator.status, owner: false });
});

app.get("/api/collaborators", requireAuth, requireOwner, async (_req, res) => {
  await connectDatabase();
  res.json(await Collaborator.find({}).sort({ createdAt: -1 }).lean());
});

app.patch("/api/collaborators", requireAuth, requireOwner, async (req, res) => {
  await connectDatabase();
  const status = req.body.status as CollaboratorStatus;
  if (!["pending", "approved", "blocked"].includes(status)) return res.status(400).json({ message: "Status inválido." });
  const updated = await Collaborator.findByIdAndUpdate(req.query.id, { status }, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ message: "Solicitação não encontrada." });
  res.json(updated);
});

app.delete("/api/collaborators", requireAuth, requireOwner, async (req, res) => {
  await connectDatabase();
  await Collaborator.findByIdAndDelete(req.query.id);
  res.status(204).end();
});

app.get("/api/admin-products", requireAuth, requireAccess, async (_req, res) => {
  await connectDatabase();
  const products = await Product.find({}).sort({ createdAt: 1 }).lean();
  res.json(products);
});

app.post("/api/products", requireAuth, requireAccess, async (req, res) => {
  await connectDatabase();
  const product = await Product.create(normalize(req.body));
  res.status(201).json(product);
});

app.put("/api/products/:id", requireAuth, requireAccess, async (req, res) => {
  await connectDatabase();
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "ID inválido." });
  const product = await Product.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Item não encontrado." });
  res.json(product);
});

app.delete("/api/products/:id", requireAuth, requireAccess, async (req, res) => {
  await connectDatabase();
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "ID inválido." });
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Item não encontrado." });
  res.status(204).end();
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const message = error instanceof Error ? error.message : "Erro interno.";
  res.status(500).json({ message });
});

function normalize(body: Partial<ProductInput>): ProductInput {
  return {
    name: String(body.name || "").trim(),
    category: String(body.category || "").trim(),
    price: Number(body.price),
    image: String(body.image || ""),
    tag: String(body.tag || "").trim(),
    type: body.type === "serviço" ? "serviço" : "produto",
    active: body.active !== false,
  };
}
