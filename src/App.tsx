import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
};

const defaultProducts: Product[] = [
  { id: 1, name: "Kit Festa Jardim Encantado", category: "Kits festa", price: 189.9, image: "https://images.unsplash.com/photo-1578922864601-79dcc7cbcea9?auto=format&fit=crop&w=900&q=85", tag: "Mais pedido" },
  { id: 2, name: "Topo de Bolo Personalizado", category: "Papelaria", price: 42.9, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", tag: "Personalizável" },
  { id: 3, name: "Caixa Milk • 10 unidades", category: "Papelaria", price: 69.9, image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=85" },
  { id: 4, name: "Arco de Balões Orgânico", category: "Balões", price: 249.9, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=85", tag: "Sob medida" },
  { id: 5, name: "Kit Lembrancinhas Luxo", category: "Kits festa", price: 149.9, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85" },
  { id: 6, name: "Convite Digital Animado", category: "Convites", price: 39.9, image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85", tag: "Entrega rápida" },
  { id: 7, name: "Balão Bubble Personalizado", category: "Balões", price: 79.9, image: "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=900&q=85" },
  { id: 8, name: "Caixa Pirâmide • 10 unidades", category: "Papelaria", price: 74.9, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85" },
];

const defaultCategories = ["Todos", "Kits festa", "Papelaria", "Balões", "Convites"];
const categoryMeta: Record<string, { icon: string; color: string }> = {
  Todos: { icon: "✦", color: "yellow" },
  "Kits festa": { icon: "🎉", color: "pink" },
  Papelaria: { icon: "✂️", color: "blue" },
  Balões: { icon: "🎈", color: "mint" },
  Convites: { icon: "✉️", color: "lavender" },
};
const STORAGE_KEY = "magic-paper-decor:data";
type LocalData = { version: 1; products: Product[]; categories: string[]; cart: Record<number, number> };
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as Partial<LocalData>;
        if (Array.isArray(data.products) && data.products.length) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories);
        if (data.cart && typeof data.cart === "object") setCart(data.cart);
      } else {
        const legacyCart = window.localStorage.getItem("magic-cart");
        if (legacyCart) setCart(JSON.parse(legacyCart));
      }
    } catch {
      setProducts(defaultProducts);
      setCategories(defaultCategories);
      setCart({});
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const data: LocalData = { version: 1, products, categories, cart };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.removeItem("magic-cart");
  }, [products, categories, cart, storageReady]);

  const filtered = useMemo(() => products.filter((product) =>
    (category === "Todos" || product.category === category) &&
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  ), [products, category, search]);
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = products.reduce((sum, product) => sum + (cart[product.id] || 0) * product.price, 0);
  const items = products.filter((product) => cart[product.id]);

  const updateCart = (id: number, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current, [id]: next };
      if (!next) delete updated[id];
      return updated;
    });
  };

  const sendOrder = () => {
    const lines = items.map((product) => `• ${cart[product.id]}x ${product.name} — ${money(product.price * cart[product.id])}`);
    const message = ["Olá, Magic Paper Decor! ✨", "Gostaria de solicitar este orçamento:", "", ...lines, "", `Total estimado: ${money(total)}`, "", "Podemos conversar sobre tema, personalização e prazo?"].join("\n");
    window.open(`https://wa.me/5554999999999?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main>
      <div className="announcement">Pedidos personalizados para Gravataí e região <span>• Orçamentos pelo WhatsApp</span></div>
      <header className="header">
        <a className="brand" href="#" aria-label="Magic Paper Decor">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><strong>Magic</strong><small>Paper Decor</small></span>
        </a>
        <label className="header-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O que você está procurando?" />
          {search && <button onClick={() => setSearch("")} aria-label="Limpar busca">×</button>}
        </label>
        <a className="instagram" href="https://instagram.com/magicpaperdecor" target="_blank" rel="noreferrer">@magicpaperdecor</a>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola com ${count} itens`}>
          <span>🛍️</span><b>Sacola</b>{count > 0 && <em>{count}</em>}
        </button>
      </header>

      <section className="catalog-intro">
        <div>
          <span className="catalog-label">Catálogo online</span>
          <h1>Feito à mão para<br /><em>momentos especiais</em></h1>
          <p>Escolha seus produtos, adicione à sacola e envie o pedido. Personalizamos tema, nome, idade e cores.</p>
        </div>
        <div className="catalog-art">
          <div className="balloon balloon-a" />
          <div className="balloon balloon-b" />
          <div className="balloon balloon-c" />
          <span>✂</span>
          <b>100%<small>personalizado</small></b>
        </div>
      </section>

      <section className="category-strip" aria-label="Categorias do catálogo">
        {categories.map((item) => {
          const meta = categoryMeta[item] || categoryMeta.Todos;
          return (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
              <span className={`category-icon ${meta.color}`}>{meta.icon}</span>
              <b>{item}</b>
              <small>{item === "Todos" ? products.length : products.filter((product) => product.category === item).length} itens</small>
            </button>
          );
        })}
      </section>

      <section className="catalog-shell">
        <aside className="catalog-sidebar">
          <div><span>CATÁLOGO</span><b>Categorias</b></div>
          {categories.map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
              <span>{item}</span><em>{item === "Todos" ? products.length : products.filter((product) => product.category === item).length}</em>
            </button>
          ))}
          <div className="help-card">
            <span>♡</span><b>Quer algo diferente?</b>
            <p>Criamos peças sob medida para o tema da sua festa.</p>
            <a href="https://wa.me/5554999999999" target="_blank" rel="noreferrer">Pedir personalizado →</a>
          </div>
        </aside>

        <div className="catalog-content">
          <div className="catalog-toolbar">
            <div><span>{category}</span><h2>{filtered.length} {filtered.length === 1 ? "produto" : "produtos"}</h2></div>
            <label className="mobile-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." /></label>
            <span className="sort-label">Ordenar: <b>Mais populares</b>⌄</span>
          </div>

          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.tag && <span className="tag">{product.tag}</span>}
                  <button className="favorite" aria-label={`Favoritar ${product.name}`}>♡</button>
                </div>
                <div className="product-info">
                  <small>{product.category}</small>
                  <h3>{product.name}</h3>
                  <div className="price-row">
                    <div><span>A partir de</span><strong>{money(product.price)}</strong></div>
                    {cart[product.id] ? (
                      <div className="stepper" aria-label={`Quantidade de ${product.name}`}>
                        <button onClick={() => updateCart(product.id, -1)} aria-label="Diminuir quantidade">−</button>
                        <b>{cart[product.id]}</b>
                        <button onClick={() => updateCart(product.id, 1)} aria-label="Aumentar quantidade">+</button>
                      </div>
                    ) : <button className="add" onClick={() => updateCart(product.id, 1)}>Adicionar <span>＋</span></button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && <div className="empty"><span>⌕</span><h3>Nenhum produto encontrado</h3><p>Tente buscar outro nome ou escolher uma categoria.</p></div>}
        </div>
      </section>

      <footer>
        <div className="brand light"><span className="brand-mark"><i /><i /><i /></span><span><strong>Magic</strong><small>Paper Decor</small></span></div>
        <p>Catálogo de produtos personalizados • Gravataí/RS</p>
        <a href="https://instagram.com/magicpaperdecor" target="_blank" rel="noreferrer">Instagram ↗</a>
      </footer>

      {count > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span>🛍️ {count} {count === 1 ? "item" : "itens"}</span><strong>Ver sacola • {money(total)}</strong></button>}
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}>
        <aside className="cart-drawer" onClick={(event) => event.stopPropagation()} aria-label="Sua sacola">
          <div className="cart-header"><div><span>SEU PEDIDO</span><h2>Minha sacola</h2></div><button onClick={() => setCartOpen(false)} aria-label="Fechar carrinho">×</button></div>
          {!items.length ? <div className="cart-empty"><span>🛍️</span><h3>Sua sacola está vazia</h3><p>Adicione os produtos que deseja pedir.</p><button className="primary" onClick={() => setCartOpen(false)}>Ver produtos</button></div> :
          <>
            <div className="cart-items">{items.map((product) => <div className="cart-item" key={product.id}>
              <img src={product.image} alt="" />
              <div><small>{product.category}</small><strong>{product.name}</strong><span>{money(product.price)}</span></div>
              <div className="stepper"><button onClick={() => updateCart(product.id, -1)}>−</button><b>{cart[product.id]}</b><button onClick={() => updateCart(product.id, 1)}>+</button></div>
            </div>)}</div>
            <div className="cart-footer"><div><span>Total estimado</span><strong>{money(total)}</strong></div><p>O valor final pode variar conforme a personalização.</p><button className="whatsapp" onClick={sendOrder}>◉ Enviar pedido pelo WhatsApp</button></div>
          </>}
        </aside>
      </div>}
    </main>
  );
}
