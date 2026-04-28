import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, LogOut } from 'lucide-react';

const CATEGORIES = ['Construção', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas'];

interface Promotion {
  id: string; type: 'CATEGORY' | 'PRODUCT'; target: string;
  discountPercent: number; active: boolean; title: string;
  startsAt?: string; endsAt?: string;
}

interface AdminPromosProps { onBack: () => void; onLogout: () => void; }

const emptyForm = { type: 'CATEGORY', target: '', discountPercent: '', title: '', startsAt: '', endsAt: '' };

const AdminPromos: React.FC<AdminPromosProps> = ({ onBack, onLogout }) => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('auth_token');
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions', { headers: authHeaders });
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (e) {
      // Handle error silently
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleToggle = async (promo: Promotion) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ active: !promo.active })
      });
      if (res.ok) setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
    } catch { alert('Erro ao atualizar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta promoção?')) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) setPromos(prev => prev.filter(p => p.id !== id));
    } catch { alert('Erro ao remover'); }
  };

  const handleSave = async () => {
    if (!form.title || !form.target || !form.discountPercent) {
      setFormError('Título, target e desconto são obrigatórios'); return;
    }
    const discount = Number(form.discountPercent);
    if (discount <= 0 || discount > 100) {
      setFormError('Desconto deve ser entre 0.01 e 100'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({
          type: form.type, target: form.target, discountPercent: discount,
          title: form.title,
          startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined,
        })
      });
      if (!res.ok) { const err = await res.json(); setFormError(err.message); return; }
      const newPromo = await res.json();
      setPromos(prev => [newPromo, ...prev]);
      setShowForm(false); setForm(emptyForm); setFormError('');
    } catch { setFormError('Erro ao salvar'); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-surface-low rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1";

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-white dark:bg-surface-lowest p-2 rounded-lg shadow-sm"><ChevronLeft /></button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Promoções</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-md">
            <Plus size={18} /> Nova Promoção
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-2 bg-white dark:bg-surface-lowest text-red-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-red-50">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      {showForm && (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl p-6 shadow-xl mb-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">Nova Promoção</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, target: '' }))}
                className={inputClass}>
                <option value="CATEGORY">Por Categoria</option>
                <option value="PRODUCT">Por Produto (UUID)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{form.type === 'CATEGORY' ? 'Categoria' : 'UUID do Produto'}</label>
              {form.type === 'CATEGORY' ? (
                <select value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  className={inputClass}>
                  <option value="">Selecione...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={inputClass} />
              )}
            </div>
            <div>
              <label className={labelClass}>Título do Banner</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: 15% OFF em Construção" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Desconto %</label>
              <input type="number" min="0.01" max="100" step="0.01"
                value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                placeholder="15" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Início (opcional)</label>
              <input type="datetime-local" value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fim (opcional)</label>
              <input type="datetime-local" value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                className={inputClass} />
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs font-bold mt-3">{formError}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setShowForm(false); setFormError(''); setForm(emptyForm); }}
              className="bg-surface-low text-slate-700 dark:text-slate-300 font-bold px-6 py-3 rounded-xl">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-surface-lowest rounded-xl animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          Nenhuma promoção cadastrada.
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-surface-low border-b border-slate-100 dark:border-slate-700">
              <tr>
                {['Título', 'Tipo', 'Target', 'Desconto', 'Ativo', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {promos.map(promo => (
                <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-surface-low transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{promo.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      promo.type === 'CATEGORY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {promo.type === 'CATEGORY' ? 'Categoria' : 'Produto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{promo.target}</td>
                  <td className="px-4 py-3 font-bold text-primary">{promo.discountPercent}%</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(promo)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${promo.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${promo.active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(promo.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPromos;
