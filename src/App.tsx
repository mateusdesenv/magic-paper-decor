import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
  type: "produto" | "serviço";
  active: boolean;
};

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Todos: { icon: "✦", color: "yellow" },
  "Kits festa": { icon: "🎉", color: "pink" },
  Papelaria: { icon: "✂️", color: "blue" },
  Balões: { icon: "🎈", color: "mint" },
  Convites: { icon: "✉️", color: "lavender" },
};
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
        return response.json() as Promise<Product[]>;
      })
      .then(setProducts)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))], [products]);

  const filtered = useMemo(() => products.filter((product) =>
    (category === "Todos" || product.category === category) &&
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  ), [products, category, search]);
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = products.reduce((sum, product) => sum + (cart[product._id] || 0) * product.price, 0);
  const items = products.filter((product) => cart[product._id]);

  const updateCart = (id: string, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current, [id]: next };
      if (!next) delete updated[id];
      return updated;
    });
  };

  const sendOrder = () => {
    const lines = items.map((product) => `• ${cart[product._id]}x ${product.name} — ${money(product.price * cart[product._id])}`);
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

          {loading && <div className="catalog-state">Carregando catálogo…</div>}
          {error && <div className="catalog-state error">{error}<button onClick={() => window.location.reload()}>Tentar novamente</button></div>}
          {!loading && !error && <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product._id}>
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
                    {cart[product._id] ? (
                      <div className="stepper" aria-label={`Quantidade de ${product.name}`}>
                        <button onClick={() => updateCart(product._id, -1)} aria-label="Diminuir quantidade">−</button>
                        <b>{cart[product._id]}</b>
                        <button onClick={() => updateCart(product._id, 1)} aria-label="Aumentar quantidade">+</button>
                      </div>
                    ) : <button className="add" onClick={() => updateCart(product._id, 1)}>Adicionar <span>＋</span></button>}
                  </div>
                </div>
              </article>
            ))}
          </div>}
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
            <div className="cart-items">{items.map((product) => <div className="cart-item" key={product._id}>
              <img src={product.image} alt="" />
              <div><small>{product.category}</small><strong>{product.name}</strong><span>{money(product.price)}</span></div>
              <div className="stepper"><button onClick={() => updateCart(product._id, -1)}>−</button><b>{cart[product._id]}</b><button onClick={() => updateCart(product._id, 1)}>+</button></div>
            </div>)}</div>
            <div className="cart-footer"><div><span>Total estimado</span><strong>{money(total)}</strong></div><p>O valor final pode variar conforme a personalização.</p><button className="whatsapp" onClick={sendOrder}>◉ Enviar pedido pelo WhatsApp</button></div>
          </>}
        </aside>
      </div>}
    </main>
  );
}

type FormState = { name: string; category: string; price: string; image: string; tag: string; type: "produto" | "serviço"; active: boolean };
const emptyForm: FormState = { name: "", category: "", price: "", image: "", tag: "", type: "produto", active: true };
function AdminLogin({ user, onLogin }: { user: User | null; onLogin: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const login = async () => {
    setBusy(true); setError("");
    try { await signInWithPopup(auth, googleProvider); onLogin(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível entrar com o Google."); }
    finally { setBusy(false); }
  };
  return <main className="admin-login">
    <div className="login-card">
      <div className="brand"><span className="brand-mark"><i /><i /><i /></span><span><strong>Magic</strong><small>Paper Decor</small></span></div>
      <span className="admin-kicker">ÁREA ADMINISTRATIVA</span>
      <h1>Bem-vinda de volta</h1>
      <p>Use sua conta Google para gerenciar os produtos e serviços do catálogo.</p>
      {error && <div className="admin-message">{error}</div>}
      <button className="google-login" onClick={login} disabled={busy}><span>G</span>{busy ? "Conectando…" : user ? "Continuar para o painel" : "Entrar com Google"}</button>
      <small>Acesso protegido pelo Firebase Authentication.</small>
    </div>
  </main>;
}

function Admin({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const authenticatedFetch = async (url: string, init: RequestInit = {}) => {
    const token = await user.getIdToken();
    return fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } });
  };
  const load = () => authenticatedFetch("/api/admin-products").then(async (response) => {
    if (!response.ok) throw new Error("Falha ao carregar itens.");
    setProducts(await response.json());
  }).catch((error: Error) => setMessage(error.message));

  useEffect(() => { void load(); }, []);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); setMessage(""); };
  const startEdit = (product: Product) => {
    setEditing(product._id);
    setForm({ name: product.name, category: product.category, price: String(product.price), image: product.image, tag: product.tag || "", type: product.type, active: product.active });
    setOpen(true);
    setMessage("");
  };
  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.image) return setMessage("Selecione uma imagem.");
    setBusy(true);
    setMessage("");
    const response = await authenticatedFetch(editing ? `/api/products/${editing}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Não foi possível salvar.");
    } else {
      setOpen(false);
      await load();
    }
    setBusy(false);
  };
  const remove = async (product: Product) => {
    if (!window.confirm(`Excluir “${product.name}”?`)) return;
    const response = await authenticatedFetch(`/api/products/${product._id}`, { method: "DELETE" });
    if (response.ok) await load(); else setMessage("Não foi possível excluir.");
  };

  return <main className="admin-page">
    <aside className="admin-nav">
      <div className="brand light"><span className="brand-mark"><i /><i /><i /></span><span><strong>Magic</strong><small>Paper Decor</small></span></div>
      <nav><b>▦ Produtos e serviços</b></nav>
      <div className="admin-user">{user.photoURL && <img src={user.photoURL} alt="" />}<span>{user.displayName || user.email}</span><button onClick={onLogout}>Sair</button></div>
      <a href="/" target="_blank">Ver catálogo ↗</a>
    </aside>
    <section className="admin-main">
      <header><div><span className="admin-kicker">GESTÃO DO CATÁLOGO</span><h1>Produtos e serviços</h1><p>Cadastre e atualize os itens exibidos no catálogo.</p></div><button onClick={startCreate}>＋ Novo item</button></header>
      <div className="admin-stats">
        <div><span>Total de itens</span><b>{products.length}</b></div>
        <div><span>Produtos ativos</span><b>{products.filter((item) => item.active && item.type === "produto").length}</b></div>
        <div><span>Serviços ativos</span><b>{products.filter((item) => item.active && item.type === "serviço").length}</b></div>
      </div>
      {message && <div className="admin-message">{message}</div>}
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Item</th><th>Tipo</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>{products.map((product) => <tr key={product._id}>
          <td><div className="admin-product"><img src={product.image} alt="" /><div><b>{product.name}</b><small>{product.tag || "Sem destaque"}</small></div></div></td>
          <td>{product.type}</td><td>{product.category}</td><td>{money(product.price)}</td>
          <td><span className={product.active ? "status-active" : "status-inactive"}>{product.active ? "Ativo" : "Inativo"}</span></td>
          <td><div className="table-actions"><button onClick={() => startEdit(product)}>Editar</button><button className="delete" onClick={() => remove(product)}>Excluir</button></div></td>
        </tr>)}</tbody>
      </table></div>
    </section>
    {open && <div className="admin-modal" onMouseDown={() => setOpen(false)}><form onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span className="admin-kicker">{editing ? "EDITAR ITEM" : "NOVO ITEM"}</span><h2>{editing ? "Atualizar cadastro" : "Cadastrar produto ou serviço"}</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></header>
      <div className="form-grid">
        <label className="full">Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as FormState["type"] })}><option value="produto">Produto</option><option value="serviço">Serviço</option></select></label>
        <label>Categoria<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
        <label>Preço<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
        <label>Destaque<input value={form.tag} placeholder="Ex.: Mais pedido" onChange={(event) => setForm({ ...form, tag: event.target.value })} /></label>
        <label className="full image-field">Imagem<input accept="image/*" type="file" onChange={(event) => handleImage(event.target.files?.[0])} /><span>{form.image ? "Imagem pronta em base64 ✓" : "Escolher imagem"}</span></label>
        {form.image && <img className="image-preview" src={form.image} alt="Prévia" />}
        <label className="check full"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Exibir este item no catálogo</label>
      </div>
      {message && <div className="admin-message">{message}</div>}
      <footer><button type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="save" disabled={busy}>{busy ? "Salvando…" : "Salvar item"}</button></footer>
    </form></div>}
  </main>;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  useEffect(() => onAuthStateChanged(auth, (current) => { setUser(current); setAuthReady(true); }), []);
  const goAdmin = () => {
    window.history.pushState({}, "", "/admin");
    setPath("/admin");
  };
  if (path.startsWith("/admin") && !authReady) return <main className="auth-loading">Verificando acesso…</main>;
  if (path === "/admin/login") {
    if (user) { queueMicrotask(goAdmin); return null; }
    return <AdminLogin user={user} onLogin={goAdmin} />;
  }
  if (path === "/admin") {
    if (!user) {
      window.history.replaceState({}, "", "/admin/login");
      queueMicrotask(() => setPath("/admin/login"));
      return null;
    }
    return <Admin user={user} onLogout={async () => { await signOut(auth); window.history.pushState({}, "", "/admin/login"); setPath("/admin/login"); }} />;
  }
  return <Catalog />;
}
