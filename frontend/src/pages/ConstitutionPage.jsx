import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiFileText, FiEdit2, FiCheck, FiX, FiThumbsUp, FiThumbsDown, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { constitutionAPI, amendmentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function ConstitutionPage() {
  const { isAdmin, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [amendForm, setAmendForm] = useState(null); // { article_id, proposed_text, reason }
  const [tab, setTab] = useState('constitution'); // 'constitution' | 'amendments'

  const { data, isLoading } = useQuery({
    queryKey: ['constitution'],
    queryFn: () => constitutionAPI.getAll(),
  });

  const { data: amendsData } = useQuery({
    queryKey: ['amendments'],
    queryFn: () => amendmentsAPI.getAll(),
  });

  const proposeMutation = useMutation({
    mutationFn: (data) => amendmentsAPI.create(data),
    onSuccess: () => {
      toast.success('Amendment proposed!');
      setAmendForm(null);
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, vote }) => amendmentsAPI.vote(id, { vote }),
    onSuccess: () => {
      toast.success('Vote recorded!');
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => amendmentsAPI.approve(id),
    onSuccess: () => {
      toast.success('Amendment approved and applied!');
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
      queryClient.invalidateQueries({ queryKey: ['constitution'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => amendmentsAPI.reject(id),
    onSuccess: () => {
      toast.success('Amendment rejected');
      queryClient.invalidateQueries({ queryKey: ['amendments'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const articles = data?.data?.articles || [];
  const amendments = amendsData?.data?.amendments || [];

  const statusBadge = (status) => {
    const classes = {
      proposed: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classes[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Constitution</h1>
          <p className="text-sm text-gray-500">STOBA 98 Constitution (2017) — Under Review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('constitution')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'constitution' ? 'border-stoba-green text-stoba-green' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiFileText className="inline mr-1" /> Articles ({articles.length})
        </button>
        <button
          onClick={() => setTab('amendments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'amendments' ? 'border-stoba-green text-stoba-green' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiEdit2 className="inline mr-1" /> Amendments ({amendments.filter((a) => a.status === 'proposed').length} pending)
        </button>
      </div>

      {tab === 'constitution' && (
        <>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading constitution...</div>
          ) : articles.length > 0 ? (
            <div className="space-y-2">
              {articles.map((article) => {
                const isOpen = expanded === article.id;
                return (
                  <div key={article.id} className="card border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : article.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                        <FiFileText className="text-stoba-green flex-shrink-0" />
                        {article.title}
                        {article.version > 1 && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">v{article.version}</span>
                        )}
                      </h3>
                      {isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="mt-3 text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {article.content}
                        </div>
                        {isAdmin() && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAmendForm({
                                  article_id: article.id,
                                  proposed_text: article.content,
                                  reason: '',
                                });
                              }}
                              className="text-xs bg-stoba-yellow text-stoba-brown-dark px-3 py-1.5 rounded-lg font-medium hover:bg-stoba-yellow-light transition-colors flex items-center gap-1"
                            >
                              <FiEdit2 size={12} /> Propose Amendment
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FiFileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No constitution articles yet</p>
            </div>
          )}

          {/* Amendment Proposal Form */}
          {amendForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Propose Amendment</h3>
                  <button onClick={() => setAmendForm(null)} className="text-gray-400 hover:text-gray-600">
                    <FiX size={20} />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    proposeMutation.mutate(amendForm);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="label">Proposed New Text</label>
                    <textarea
                      className="input-field"
                      rows={10}
                      value={amendForm.proposed_text}
                      onChange={(e) => setAmendForm({ ...amendForm, proposed_text: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Edit the text above to reflect your proposed changes</p>
                  </div>
                  <div>
                    <label className="label">Reason for Amendment</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={amendForm.reason}
                      onChange={(e) => setAmendForm({ ...amendForm, reason: e.target.value })}
                      placeholder="Explain why this change is needed..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={proposeMutation.isPending}>
                      {proposeMutation.isPending ? 'Submitting...' : 'Submit Amendment'}
                    </button>
                    <button type="button" onClick={() => setAmendForm(null)} className="btn-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'amendments' && (
        <div className="space-y-4">
          {amendments.length > 0 ? (
            amendments.map((am) => (
              <div key={am.id} className="card border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{am.article_title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Proposed by {am.proposed_by_name} • {new Date(am.created_at).toLocaleDateString('en-NG')}
                    </p>
                  </div>
                  {statusBadge(am.status)}
                </div>

                {am.reason && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Reason:</p>
                    <p className="text-sm text-yellow-800">{am.reason}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Proposed Text:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{am.proposed_text}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <FiThumbsUp size={14} /> {am.votes_for} For
                  </span>
                  <span className="text-red-500 font-medium flex items-center gap-1">
                    <FiThumbsDown size={14} /> {am.votes_against} Against
                  </span>
                </div>

                {am.status === 'proposed' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    {!am.voted_by?.includes(user?.id) && (
                      <>
                        <button
                          onClick={() => voteMutation.mutate({ id: am.id, vote: 'for' })}
                          className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 flex items-center gap-1"
                          disabled={voteMutation.isPending}
                        >
                          <FiThumbsUp size={12} /> Vote For
                        </button>
                        <button
                          onClick={() => voteMutation.mutate({ id: am.id, vote: 'against' })}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 flex items-center gap-1"
                          disabled={voteMutation.isPending}
                        >
                          <FiThumbsDown size={12} /> Vote Against
                        </button>
                      </>
                    )}
                    {isAdmin() && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(am.id)}
                          className="text-xs bg-stoba-green text-white px-3 py-1.5 rounded-lg font-medium hover:bg-stoba-green-dark flex items-center gap-1"
                          disabled={approveMutation.isPending}
                        >
                          <FiCheck size={12} /> Approve & Apply
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(am.id)}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-1"
                          disabled={rejectMutation.isPending}
                        >
                          <FiX size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <FiClock size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No amendments proposed yet</p>
              {isAdmin() && <p className="text-gray-400 text-sm mt-1">Go to an article and click "Propose Amendment"</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
