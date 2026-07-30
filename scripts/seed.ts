import dotenv from "dotenv";
import { connectDatabase } from "../server/db.js";
import { Product } from "../server/product.js";

dotenv.config({ path: ".env.local" });
const items = [
  ["Kit Festa Jardim Encantado", "Kits festa", 189.9, "https://images.unsplash.com/photo-1578922864601-79dcc7cbcea9?auto=format&fit=crop&w=900&q=85", "Mais pedido", "produto"],
  ["Topo de Bolo Personalizado", "Papelaria", 42.9, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", "Personalizável", "produto"],
  ["Caixa Milk • 10 unidades", "Papelaria", 69.9, "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=85", "", "produto"],
  ["Arco de Balões Orgânico", "Balões", 249.9, "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=85", "Sob medida", "serviço"],
  ["Kit Lembrancinhas Luxo", "Kits festa", 149.9, "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85", "", "produto"],
  ["Convite Digital Animado", "Convites", 39.9, "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85", "Entrega rápida", "serviço"],
  ["Balão Bubble Personalizado", "Balões", 79.9, "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=900&q=85", "", "produto"],
  ["Caixa Pirâmide • 10 unidades", "Papelaria", 74.9, "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85", "", "produto"],
] as const;

async function imageToBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar imagem (${response.status}).`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
}

await connectDatabase();
if (await Product.countDocuments() === 0) {
  const products = await Promise.all(items.map(async ([name, category, price, url, tag, type]) => ({
    name, category, price, tag, type, active: true, image: await imageToBase64(url),
  })));
  await Product.insertMany(products);
  console.log(`${products.length} itens cadastrados.`);
} else {
  console.log("Banco já possui itens; seed não alterou os dados.");
}
process.exit(0);
