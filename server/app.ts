import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "./auth.js";
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

app.get("/api/admin/products", requireAuth, async (_req, res) => {
  await connectDatabase();
  const products = await Product.find({}).sort({ createdAt: 1 }).lean();
  res.json(products);
});

app.post("/api/products", requireAuth, async (req, res) => {
  await connectDatabase();
  const product = await Product.create(normalize(req.body));
  res.status(201).json(product);
});

app.put("/api/products/:id", requireAuth, async (req, res) => {
  await connectDatabase();
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "ID inválido." });
  const product = await Product.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Item não encontrado." });
  res.json(product);
});

app.delete("/api/products/:id", requireAuth, async (req, res) => {
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
