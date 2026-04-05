import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiTarget, FiPlus, FiChevronLeft, FiCheckCircle, FiClock,
  FiAlertCircle, FiUsers, FiDollarSign, FiX, FiSave, FiTrash2,
  FiCheck, FiXCircle, FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { contributionsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function StatusDot({ paid, pending }) {
  if (paid) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Fully Paid" />;
  if (pending) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" title="Pending" />;
  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" title="Not Paid" />;
}

// ─── LIST VIEW ───────────────────────────────────────────────
function ContributionsList({ contributions, isAdmin, onView, onCreate, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-sm text-gray-500 mt-1">Tracked contributions and levies</p>
        </div>
        {isAdmin && (
          <button onClick={onCreate} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> New Contribution
          </button>
        )}
      </div>

      {contributions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributions.map((c) => {
            const progress = c.total_collected / (c.target_amount * c.total_members) * 100;
            return (
              <div
                key={c.id}
                className="card hover:shadow-md transition-shadow cursor-pointer group relative"
                onClick={() => onView(c.id)}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(c); }}
                    className="absolute top-3 right-3 hidden group-hover:block p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-stoba-green/10">
                    <FiTarget className="text-stoba-green" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status}
                      </span>
                      {c.deadline && (
                        <span className="text-xs text-gray-400">
                          Due: {new Date(c.deadline).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Target/Person</p>
                    <p className="font-bold text-gray-900">₦{Number(c.target_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Collected</p>
                    <p className="font-bold text-stoba-green">₦{Number(c.total_collected).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Members Paid</p>
                    <p className="font-bold text-blue-600">{c.members_paid}/{c.total_members}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-stoba-green h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{Math.round(progress)}% collected</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiTarget className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400">No contributions yet</p>
          {isAdmin && (
            <button onClick={onCreate} className="btn-primary mt-4 text-sm">
              <FiPlus className="inline mr-1" size={14} /> Create First Contribution
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL VIEW (Admin: full member tracker; Member: own status) ─────────
function ContributionDetail({ id, isAdmin, isAdminOrExco, user, onBack }) {
  const queryClient = useQueryClient();
  const [payAmount, setPayAmount] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contribution', id],
    queryFn: () => contributionsAPI.getById(id),
  });

  const payMutation = useMutation({
    mutationFn: (payload) => contributionsAPI.pay(id, payload),
    onSuccess: () => {
      toast.success('Payment submitted!');
      setShowPayForm(false);
      setPayAmount('');
      queryClient.invalidateQueries({ queryKey: ['contribution', id] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ pid, status, admin_note }) =>
      contributionsAPI.verifyPayment(id, pid, { status, admin_note }),
    onSuccess: () => {
      toast.success('Payment updated');
      queryClient.invalidateQueries({ queryKey: ['contribution', id] });
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const contrib = data?.data?.contribution;
  const members = data?.data?.members || [];
  if (!contrib) return <div className="text-center py-12 text-gray-400">Not found</div>;

  const totalExpected = contrib.target_amount * contrib.total_members;
  const progressPct = Math.round((contrib.total_collected / totalExpected) * 100);

  const handlePay = (e) => {
    e.preventDefault();
    const val = parseFloat(payAmount);
    if (!val || val <= 0) return toast.error('Enter a valid amount');
    payMutation.mutate({ amount_paid: val });
  };

  const handleVerify = (pid, status) => {
    verifyMutation.mutate({ pid, status });
  };

  // Find current user's status
  const myStatus = members.find((m) => m.user_id === user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{contrib.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{contrib.description}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          contrib.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {contrib.status}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <FiDollarSign className="mx-auto text-stoba-green mb-1" size={22} />
          <p className="text-xs text-gray-500">Target/Person</p>
          <p className="text-lg font-bold">₦{Number(contrib.target_amount).toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <FiCheckCircle className="mx-auto text-blue-600 mb-1" size={22} />
          <p className="text-xs text-gray-500">Collected</p>
          <p className="text-lg font-bold text-blue-600">₦{Number(contrib.total_collected).toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <FiUsers className="mx-auto text-stoba-brown mb-1" size={22} />
          <p className="text-xs text-gray-500">Fully Paid</p>
          <p className="text-lg font-bold">{contrib.members_fully_paid}/{contrib.total_members}</p>
        </div>
        <div className="card text-center">
          <FiAlertCircle className="mx-auto text-orange-500 mb-1" size={22} />
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-lg font-bold text-orange-500">₦{Number(totalExpected - contrib.total_collected).toLocaleString()}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-stoba-green">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-stoba-green to-stoba-green-light h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
        {contrib.deadline && (
          <p className="text-xs text-gray-400 mt-2">
            Deadline: {new Date(contrib.deadline).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* Member's own status + Pay button (for non-admin members) */}
      {myStatus && (
        <div className="card border-2 border-stoba-green/20">
          <h3 className="font-semibold text-gray-900 mb-3">Your Status</h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="font-bold text-stoba-green">₦{Number(myStatus.amount_paid).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="font-bold text-yellow-600">₦{Number(myStatus.pending_amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className="font-bold text-orange-500">₦{Number(myStatus.outstanding).toLocaleString()}</p>
            </div>
          </div>
          {myStatus.fully_paid ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <FiCheckCircle /> <span className="font-medium text-sm">Fully paid — thank you!</span>
            </div>
          ) : contrib.status === 'active' && (
            <>
              {!showPayForm ? (
                <button onClick={() => setShowPayForm(true)} className="btn-primary text-sm">
                  <FiDollarSign className="inline mr-1" size={14} /> Submit Payment
                </button>
              ) : (
                <form onSubmit={handlePay} className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="label">Amount (₦)</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 5000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={payMutation.isPending}>
                    {payMutation.isPending ? 'Submitting...' : 'Submit'}
                  </button>
                  <button type="button" onClick={() => setShowPayForm(false)} className="btn-outline">
                    <FiX size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── ADMIN: Full Member Tracker Table ─── */}
      {isAdminOrExco && (
        <div className="card">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <FiEye className="text-stoba-green" /> Member Contribution Tracker
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Member</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium hidden sm:table-cell">Phone</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Paid</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Pending</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Outstanding</th>
                  {isAdmin && <th className="text-center py-3 px-2 text-gray-500 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const pendingPayments = (m.payments || []).filter((p) => p.status === 'pending');
                  return (
                    <tr key={m.user_id} className={`border-b border-gray-50 ${m.fully_paid ? 'bg-green-50/50' : m.outstanding === contrib.target_amount ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3 px-2">
                        <StatusDot paid={m.fully_paid} pending={m.pending_amount > 0} />
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-900">{m.full_name}</p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </td>
                      <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{m.phone || '—'}</td>
                      <td className="py-3 px-2 text-right font-semibold text-stoba-green">
                        ₦{Number(m.amount_paid).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-yellow-600">
                        {m.pending_amount > 0 ? `₦${Number(m.pending_amount).toLocaleString()}` : '—'}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${m.outstanding > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                        {m.fully_paid ? '✓ Paid' : `₦${Number(m.outstanding).toLocaleString()}`}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-2">
                          {pendingPayments.length > 0 && (
                            <div className="flex items-center justify-center gap-1">
                              {pendingPayments.map((pp) => (
                                <div key={pp.id} className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400">₦{Number(pp.amount_paid).toLocaleString()}</span>
                                  <button
                                    onClick={() => handleVerify(pp.id, 'verified')}
                                    className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                                    title="Verify"
                                  >
                                    <FiCheck size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleVerify(pp.id, 'rejected')}
                                    className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                                    title="Reject"
                                  >
                                    <FiXCircle size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1"><StatusDot paid /> Fully Paid</span>
            <span className="flex items-center gap-1"><StatusDot pending /> Has Pending</span>
            <span className="flex items-center gap-1"><StatusDot /> Not Paid</span>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="flex justify-center opacity-10 mt-8">
        <img src="/logo.png" alt="" className="w-20 h-20" />
      </div>
    </div>
  );
}

// ─── CREATE FORM ─────────────────────────────────────────────
function CreateContributionForm({ onBack }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', target_amount: '', deadline: '' });

  const createMutation = useMutation({
    mutationFn: (data) => contributionsAPI.create(data),
    onSuccess: () => {
      toast.success('Contribution created!');
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      onBack();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.target_amount) {
      return toast.error('Title and target amount are required');
    }
    createMutation.mutate({
      ...form,
      target_amount: parseFloat(form.target_amount),
      deadline: form.deadline || null,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Contribution</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Title</label>
            <input
              className="input-field"
              placeholder="e.g. School Building Renovation Fund"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe the purpose of this contribution..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Target Amount per Person (₦)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 20000"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                min="1"
                required
              />
            </div>
            <div>
              <label className="label">Deadline (optional)</label>
              <input
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={createMutation.isPending}>
              <FiSave size={14} /> {createMutation.isPending ? 'Creating...' : 'Create Contribution'}
            </button>
            <button type="button" onClick={onBack} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function ContributionsPage() {
  const { user, isAdmin, isAdminOrExco } = useAuthStore();
  const queryClient = useQueryClient();
  const [view, setView] = useState('list'); // list | detail | create
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contributions'],
    queryFn: () => contributionsAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contributionsAPI.delete(id),
    onSuccess: () => {
      toast.success('Contribution deleted');
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const contributions = data?.data?.contributions || [];

  const handleView = (id) => { setSelectedId(id); setView('detail'); };
  const handleBack = () => { setView('list'); setSelectedId(null); };
  const handleDelete = (c) => {
    if (window.confirm(`Delete "${c.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(c.id);
    }
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading contributions...</div>;

  if (view === 'create') {
    return <CreateContributionForm onBack={handleBack} />;
  }

  if (view === 'detail' && selectedId) {
    return (
      <ContributionDetail
        id={selectedId}
        isAdmin={isAdmin()}
        isAdminOrExco={isAdminOrExco()}
        user={user}
        onBack={handleBack}
      />
    );
  }

  return (
    <ContributionsList
      contributions={contributions}
      isAdmin={isAdmin()}
      onView={handleView}
      onCreate={() => setView('create')}
      onDelete={handleDelete}
    />
  );
}
