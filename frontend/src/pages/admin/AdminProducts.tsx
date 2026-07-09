import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, LogOut, Search, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, Package } from 'lucide-react';
import { CATEGORIES } from '../../types/api';

const emptyForm = {
  name: '', description: '', category: 'Construção', sku: '',
  stock: 0, unitPrice: 0, tieredPricing: [] as { minQty: number; price: number }[],
};

type SortField = 'name' | 'stock' | 'unitPrice' | 'category';
type SortDir = 'asc' | 'desc';

const AdminProducts: React.FC<{ onBack: () => void, onLogout: () => void }> = ({ onBack, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  const token = () => localStorage.getItem('auth_token');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      setProducts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      category: p.category,
      sku: p.sku,
      stock: p.stock,
      unitPrice: Number(p.unitPrice),
      tieredPricing: Array.isArray(p.tieredPricing) ? p.tieredPricing : [],
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.category) {
      setError('Nome, SKU e categoria são obrigatórios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? 'Erro ao salvar');
        return;
      }
      const saved = await res.json();
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? saved : p));
      } else {
        setProducts(prev => [...prev, saved]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const addTier = () => setForm(f => ({ ...f, tieredPricing: [...f.tieredPricing, { minQty: 0, price: 0 }] }));
  const removeTier = (i: number) => setForm(f => ({ ...f, tieredPricing: f.tieredPricing.filter((_, idx) => idx !== i) }));
  const updateTier = (i: number, field: 'minQty' | 'price', val: number) =>
    setForm(f => ({ ...f, tieredPricing: f.tieredPricing.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }));

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-slate-300 inline ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary inline ml-1" />
      : <ChevronDown size={12} className="text-primary inline ml-1" />;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter(p => {
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const matchCat = !categoryFilter || p.category === categoryFilter;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        let va: Product, vb: Product;
        if (sortField === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
        else if (sortField === 'stock') { va = a.stock; vb = b.stock; }
        else if (sortField === 'unitPrice') { va = Number(a.unitPrice); vb = Number(b.unitPrice); }
        else { va = a.category.toLowerCase(); vb = b.category.toLowerCase(); }
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
  }, [products, search, categoryFilter, sortField, sortDir]);

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-white dark:bg-surface-lowest p-2 rounded-lg shadow-sm"><ChevronLeft /></button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Gestão de Produtos</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition-all"
          >
            <Plus size={18} /> Novo Produto
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-white dark:bg-surface-lowest text-red-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, SKU ou categoria..."
            className="w-full bg-white dark:bg-surface-lowest rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-surface-lowest rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white dark:bg-surface-lowest rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-surface border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Produto <SortIcon field="name" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <button onClick={() => toggleSort('category')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Categoria <SortIcon field="category" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Estoque <SortIcon field="stock" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <button onClick={() => toggleSort('unitPrice')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Preço Un. <SortIcon field="unitPrice" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-400">Nenhum produto encontrado.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-surface transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">{p.sku}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold bg-slate-100 dark:bg-surface text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg">{p.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-black ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-black text-primary">R$ {Number(p.unitPrice).toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface text-slate-400 hover:text-primary transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-2xl w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <p className="text-sm text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Nome *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Categoria *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Estoque</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Preço Unitário (R$) *</label>
                  <input type="number" min={0} step={0.01} value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Descrição</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full bg-slate-50 dark:bg-surface rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
              </div>

              {/* Tiered Pricing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tabela de Preços por Volume</span>
                  <button onClick={addTier} className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
                {form.tieredPricing.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 dark:bg-surface rounded-xl">Sem preços por volume</p>
                ) : form.tieredPricing.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Qtd mín.</label>
                      <input type="number" min={1} value={tier.minQty} onChange={e => updateTier(i, 'minQty', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-surface rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Preço (R$)</label>
                      <input type="number" min={0} step={0.01} value={tier.price} onChange={e => updateTier(i, 'price', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-surface rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button onClick={() => removeTier(i)} className="mt-4 p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-surface rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <Package size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100">Deletar produto?</h3>
                <p className="text-xs text-slate-400">Ação irreversível.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-surface rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
