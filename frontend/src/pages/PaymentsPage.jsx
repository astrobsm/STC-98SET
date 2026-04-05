import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUpload, FiDollarSign, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function StatusBadge({ status }) {
  const cls = status === 'verified' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
  return <span className={cls}>{status}</span>;
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: () => paymentsAPI.getSummary(),
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentsAPI.getAll({ limit: 50 }),
  });

  const submitMutation = useMutation({
    mutationFn: (formData) => paymentsAPI.create(formData),
    onSuccess: () => {
      toast.success('Payment submitted for verification!');
      setShowForm(false);
      setAmount('');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Submission failed'),
  });

  const summary = summaryData?.data?.summary;
  const payments = paymentsData?.data?.payments || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0 || val > 10000) {
      toast.error('Enter a valid amount (₦1 - ₦10,000)');
      return;
    }
    const fd = new FormData();
    fd.append('amount_paid', val);
    if (file) fd.append('payment_proof', file);
    submitMutation.mutate(fd);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Submit Payment'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <FiDollarSign className="mx-auto text-stoba-green mb-2" size={28} />
          <p className="text-sm text-gray-500">Total Due</p>
          <p className="text-2xl font-bold text-gray-900">₦{Number(summary?.total_due || 10000).toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <FiCheckCircle className="mx-auto text-blue-600 mb-2" size={28} />
          <p className="text-sm text-gray-500">Amount Paid</p>
          <p className="text-2xl font-bold text-blue-600">₦{Number(summary?.total_paid || 0).toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <FiClock className="mx-auto text-orange-500 mb-2" size={28} />
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-orange-500">₦{Number(summary?.outstanding || 10000).toLocaleString()}</p>
        </div>
      </div>

      {/* Bank Info */}
      <div className="card bg-stoba-yellow/10 border-stoba-yellow/30">
        <h3 className="font-semibold text-stoba-brown mb-2">Bank Details for Payment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <p><span className="text-gray-500">Bank:</span> <span className="font-semibold">Access Bank</span></p>
          <p><span className="text-gray-500">Account:</span> <span className="font-bold text-stoba-green text-lg">0760005400</span></p>
          <p><span className="text-gray-500">Name:</span> <span className="font-semibold">STOBA 98</span></p>
        </div>
      </div>

      {/* Submit Payment Form */}
      {showForm && (
        <div className="card border-2 border-stoba-green/20">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Submit Payment Proof</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Amount Paid (₦)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="10000"
                step="any"
                required
              />
            </div>
            <div>
              <label className="label">Payment Proof (Receipt/Screenshot)</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-stoba-green transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiCheckCircle className="text-stoba-green" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <FiX className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-500">Click to upload (JPEG, PNG, PDF, max 5MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Payment History</h3>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Year</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Proof</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">{new Date(p.payment_date).toLocaleDateString('en-NG')}</td>
                    <td className="py-3 px-2 font-semibold">₦{Number(p.amount_paid).toLocaleString()}</td>
                    <td className="py-3 px-2">{p.year}</td>
                    <td className="py-3 px-2"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-2">
                      {p.payment_proof_url ? (
                        <a href={p.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-stoba-green hover:underline text-xs">
                          View
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No payments yet</p>
        )}
      </div>
    </div>
  );
}
