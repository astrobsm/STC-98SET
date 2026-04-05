import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheckCircle, FiXCircle, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../services/api';

function StatusBadge({ status }) {
  const cls = status === 'verified' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
  return <span className={cls}>{status}</span>;
}

export default function PaymentApprovalsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => paymentsAPI.getAll({ limit: 100 }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }) => paymentsAPI.verify(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Payment ${status}`);
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const payments = data?.data?.payments || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment Approvals</h1>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Member</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Proof</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{p.users?.full_name || '—'}</td>
                    <td className="py-3 px-4 font-semibold">₦{Number(p.amount_paid).toLocaleString()}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-500">
                      {new Date(p.payment_date).toLocaleDateString('en-NG')}
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {p.payment_proof_url ? (
                        <a href={p.payment_proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-stoba-green hover:underline flex items-center gap-1 text-xs">
                          <FiExternalLink size={12} /> View
                        </a>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyMutation.mutate({ id: p.id, status: 'verified' })}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            title="Verify"
                            disabled={verifyMutation.isPending}
                          >
                            <FiCheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => verifyMutation.mutate({ id: p.id, status: 'rejected' })}
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Reject"
                            disabled={verifyMutation.isPending}
                          >
                            <FiXCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
