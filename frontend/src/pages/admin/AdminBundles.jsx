/**
 * Admin Bundles — Create, edit, and delete data bundle listings.
 * Admin controls the prices users see — this is the margin management tool.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/Loader';

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const EMPTY_FORM = { network: 'MTN', name: '', size: '', validity: '', price: '', apiCode: '', isActive: true };

function BundleForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.apiCode) return toast.error('Fill in all required fields.');
    setLoading(true);
    try {
      await onSave({ ...form, price: Number(form.price) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={onCancel}>
      <div className="bg-dark-card border-t border-dark-border w-full max-w-lg mx-auto rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-black text-white text-lg mb-4">{initial?._id ? 'Edit Bundle' : 'New Bundle'}</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Network *</label>
            <select name="network" value={form.network} onChange={change} className="input">
              {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Bundle Name * (e.g. "1GB")</label>
            <input name="name" value={form.name} onChange={change} placeholder="1GB" className="input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Size (e.g. "1024MB")</label>
            <input name="size" value={form.size} onChange={change} placeholder="1024MB" className="input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Validity * (e.g. "30 days")</label>
            <input name="validity" value={form.validity} onChange={change} placeholder="30 days" className="input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Selling Price (₦) *</label>
            <input name="price" type="number" value={form.price} onChange={change} placeholder="300" className="input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">VTU API Code * (from your provider)</label>
            <input name="apiCode" value={form.apiCode} onChange={change} placeholder="MTN1GB30" className="input" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={change} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-gray-300">Active (visible to users)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const NET_COLORS = { MTN: 'text-yellow-400', Airtel: 'text-red-400', Glo: 'text-green-400', '9mobile': 'text-emerald-400' };

export default function AdminBundles() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filterNet, setFilterNet] = useState('all');

  useEffect(() => {
    api.get('/admin/bundles')
      .then(({ data }) => setBundles(data.bundles))
      .catch(() => toast.error('Failed to load bundles.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editTarget?._id) {
        const { data } = await api.put(`/admin/bundles/${editTarget._id}`, formData);
        setBundles((b) => b.map((x) => x._id === editTarget._id ? data.bundle : x));
        toast.success('Bundle updated!');
      } else {
        const { data } = await api.post('/admin/bundles', formData);
        setBundles((b) => [...b, data.bundle]);
        toast.success('Bundle created!');
      }
      setShowForm(false);
      setEditTarget(null);
    } catch {
      toast.error('Failed to save bundle.');
      throw new Error(); // keep form open
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bundle?')) return;
    try {
      await api.delete(`/admin/bundles/${id}`);
      setBundles((b) => b.filter((x) => x._id !== id));
      toast.success('Deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const displayed = filterNet === 'all' ? bundles : bundles.filter((b) => b.network === filterNet);

  return (
    <div className="min-h-screen bg-dark pb-10 max-w-lg mx-auto">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400">
            <MdArrowBack size={20} />
          </button>
          <h1 className="font-black text-xl text-white">Bundles</h1>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all"
        >
          <MdAdd size={16} /> Add
        </button>
      </div>

      {/* Network filter */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        {['all', ...NETWORKS].map((n) => (
          <button
            key={n}
            onClick={() => setFilterNet(n)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterNet === n ? 'bg-primary text-white' : 'bg-dark-card border border-dark-border text-gray-400'
            }`}
          >
            {n === 'all' ? 'All' : n}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {loading ? <Loader /> : displayed.map((b) => (
          <div key={b._id} className={`card ${!b.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold ${NET_COLORS[b.network]}`}>{b.network}</span>
                  {!b.isActive && <span className="text-xs bg-gray-500/20 text-gray-400 px-1.5 rounded">Inactive</span>}
                </div>
                <p className="font-bold text-white">{b.name}</p>
                <p className="text-xs text-gray-400">{b.validity} · Code: {b.apiCode}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-secondary text-lg">₦{b.price.toLocaleString()}</p>
                <div className="flex gap-2 mt-1 justify-end">
                  <button onClick={() => { setEditTarget(b); setShowForm(true); }} className="text-primary-light">
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="text-red-400">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <BundleForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
