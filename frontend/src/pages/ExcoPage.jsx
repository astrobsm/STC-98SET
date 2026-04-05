import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiAward, FiPhone, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { excoAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const POSITIONS = [
  'President', 'Vice President', 'Executive Secretary', 'Treasurer',
  'Public Relations Officer',
];

const emptyForm = { name: '', position: '', contact: '' };

export default function ExcoPage() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['exco-members'],
    queryFn: () => excoAPI.getAll(),
  });

  const members = data?.data?.exco_members || data?.data?.members || data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId ? excoAPI.update(editingId, payload) : excoAPI.create(payload),
    onSuccess: () => {
      toast.success(editingId ? 'EXCO member updated!' : 'EXCO member added!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['exco-members'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Operation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => excoAPI.delete(id),
    onSuccess: () => {
      toast.success('EXCO member removed');
      queryClient.invalidateQueries({ queryKey: ['exco-members'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (member) => {
    setForm({ name: member.name, position: member.position, contact: member.contact || '' });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) {
      toast.error('Name and position are required');
      return;
    }
    saveMutation.mutate(form);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove ${name} from EXCO?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EXCO Members</h1>
          <p className="text-sm text-gray-500 mt-1">Executive Committee of STOBA 98</p>
        </div>
        {isAdmin() && (
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
            {showForm ? <><FiX size={16} /> Cancel</> : <><FiPlus size={16} /> Add Member</>}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && isAdmin() && (
        <div className="card border-2 border-stoba-green/20">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            {editingId ? 'Edit EXCO Member' : 'Add EXCO Member'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Position</label>
                <select
                  className="input-field"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  required
                >
                  <option value="">Select position</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Contact (Phone/WhatsApp)</label>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={saveMutation.isPending}>
                <FiSave size={14} /> {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* EXCO Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading EXCO members...</div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="card hover:shadow-md transition-shadow relative group">
              {isAdmin() && (
                <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
                  <button
                    onClick={() => startEdit(member)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    title="Edit"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    title="Remove"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-stoba-green/10 flex items-center justify-center mb-3">
                  <FiAward className="text-stoba-green" size={28} />
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-stoba-green font-medium mt-1">{member.position}</p>
                {member.contact && (
                  <a
                    href={`tel:${member.contact}`}
                    className="flex items-center gap-1 text-xs text-gray-500 mt-2 hover:text-stoba-green transition-colors"
                  >
                    <FiPhone size={12} /> {member.contact}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiAward className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400">No EXCO members listed yet</p>
          {isAdmin() && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
              <FiPlus className="inline mr-1" size={14} /> Add First Member
            </button>
          )}
        </div>
      )}

      {/* STOBA watermark */}
      <div className="flex justify-center opacity-10 mt-8">
        <img src="/logo.png" alt="" className="w-20 h-20" />
      </div>
    </div>
  );
}
