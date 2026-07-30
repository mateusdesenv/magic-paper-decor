"use client";

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
const STORAGE_KEY = "magic-paper-decor:data";
type LocalData = {
  version: 1;
  products: Product[];
  categories: string[];
  cart: Record<number, number>;
};
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const filtered = useMemo(() => products.filter((p) =>
    (category === "Todos" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  const items = products.filter((p) => cart[p.id]);

  const updateCart = (id: number, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current, [id]: next };
      if (!next) delete updated[id];
      return updated;
    });
  };

  const sendOrder = () => {
    const lines = items.map((p) => `• ${cart[p.id]}x ${p.name} — ${money(p.price * cart[p.id])}`);
    const message = [
      "Olá, Magic Paper Decor! ✨",
      "Gostaria de solicitar este orçamento:",
      "",
      ...lines,
      "",
      `Total estimado: ${money(total)}`,
      "",
      "Podemos conversar sobre tema, personalização e prazo?",
    ].join("\n");
    window.open(`https://wa.me/5554999999999?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main>
      <div className="announcement">✨ Feito à mão, especialmente para a sua festa <span>• Gravataí e região</span></div>
      <header className="header">
        <a className="brand" href="#" aria-label="Magic Paper Decor - início">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><strong>Magic</strong><small>Paper Decor</small></span>
        </a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Navegação principal">
          <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre nós</a>
        </nav>
        <div className="header-actions">
          <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">☰</button>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrinho com ${count} itens`}>
            <span>🛍️</span><b>Minha sacola</b>{count > 0 && <em>{count}</em>}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Papelaria & festas personalizadas</div>
          <h1>Detalhes que transformam <span>momentos em magia.</span></h1>
          <p>Criamos cada peça com carinho para deixar a sua comemoração única, do jeitinho que você imaginou.</p>
          <div className="hero-actions">
            <a href="#catalogo" className="primary">Explorar catálogo <span>↓</span></a>
            <a href="https://instagram.com/magicpaperdecor" target="_blank" rel="noreferrer" className="text-link">@magicpaperdecor ↗</a>
          </div>
          <div className="trust"><span>♡ Feito com carinho</span><span>✦ 100% personalizado</span><span>⌖ Retirada em Gravataí</span></div>
        </div>
        <div className="hero-visual" aria-label="Composição de festa personalizada">
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <img src="https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?auto=format&fit=crop&w=1100&q=90" alt="Mesa decorada para festa infantil" />
          <div className="mini-card"><span>✂</span><div><small>Cada detalhe</small><strong>feito à mão</strong></div></div>
          <div className="sparkle">✦</div>
        </div>
      </section>

      <section className="catalog" id="catalogo">
        <div className="section-heading">
          <div><span className="script">Escolha os seus favoritos</span><h2>Um toque de magia para cada detalhe</h2></div>
          <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no catálogo..." /></label>
        </div>
        <div className="filters" aria-label="Filtrar produtos por categoria">
          {categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="product-grid">
          {filtered.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} loading="lazy" />
                {product.tag && <span className="tag">{product.tag}</span>}
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
                  ) : <button className="add" onClick={() => updateCart(product.id, 1)} aria-label={`Adicionar ${product.name} à sacola`}>＋</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && <div className="empty">Nenhum produto encontrado. Tente outra busca ✨</div>}
      </section>

      <section className="how" id="como-funciona">
        <div><span className="script">Simples e especial</span><h2>Do seu sonho à sua festa</h2></div>
        <ol>
          <li><b>01</b><span>Escolha</span><p>Adicione seus favoritos à sacola.</p></li>
          <li><b>02</b><span>Personalize</span><p>Conte o tema, nome, idade e cores.</p></li>
          <li><b>03</b><span>Aprove</span><p>Você recebe a arte antes da produção.</p></li>
          <li><b>04</b><span>Comemore</span><p>Retire e deixe a magia acontecer!</p></li>
        </ol>
      </section>

      <section className="about" id="sobre">
        <div className="about-image"><img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85" alt="Processo artesanal de criação em papel" /></div>
        <div><span className="script">Prazer, somos a Magic</span><h2>Afeto em forma de papel</h2><p>A Magic Paper Decor nasceu para transformar ideias em celebrações inesquecíveis. Cada recorte, laço e detalhe é criado artesanalmente, com cuidado e muita imaginação.</p><a href="https://wa.me/5554999999999" target="_blank" rel="noreferrer" className="primary">Fale com a gente no WhatsApp ↗</a></div>
      </section>

      <footer>
        <div className="brand light"><span className="brand-mark"><i /><i /><i /></span><span><strong>Magic</strong><small>Paper Decor</small></span></div>
        <p>Transformando papel em memórias desde 2023.</p>
        <a href="https://instagram.com/magicpaperdecor" target="_blank" rel="noreferrer">Instagram ↗</a>
      </footer>

      {count > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span>🛍️ {count} {count === 1 ? "item" : "itens"}</span><strong>Ver sacola • {money(total)}</strong></button>}
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}>
        <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label="Sua sacola">
          <div className="cart-header"><div><span className="script">Seus favoritos</span><h2>Minha sacola</h2></div><button onClick={() => setCartOpen(false)} aria-label="Fechar carrinho">×</button></div>
          {!items.length ? <div className="cart-empty"><span>🛍️</span><h3>Sua sacola está vazia</h3><p>Escolha os produtos que vão deixar sua festa ainda mais especial.</p><button className="primary" onClick={() => setCartOpen(false)}>Ver catálogo</button></div> :
          <>
            <div className="cart-items">{items.map((product) => <div className="cart-item" key={product.id}>
              <img src={product.image} alt="" />
              <div><small>{product.category}</small><strong>{product.name}</strong><span>{money(product.price)}</span></div>
              <div className="stepper"><button onClick={() => updateCart(product.id, -1)}>−</button><b>{cart[product.id]}</b><button onClick={() => updateCart(product.id, 1)}>+</button></div>
            </div>)}</div>
            <div className="cart-footer"><div><span>Total estimado</span><strong>{money(total)}</strong></div><p>O valor final pode variar conforme a personalização.</p><button className="whatsapp" onClick={sendOrder}><span>◉</span> Enviar pedido pelo WhatsApp</button></div>
          </>}
        </aside>
      </div>}
    </main>
  );
}
