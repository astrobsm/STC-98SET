import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUsers, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function MembersPage() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, roleFilter],
    queryFn: () => usersAPI.getAll({ search: search || undefined, role: roleFilter || undefined, limit: 100 }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => usersAPI.updateRole(id, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const users = data?.data?.users || [];

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700';
    if (role === 'exco') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Members</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="exco">EXCO</option>
          <option value="member">Member</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading members...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium hidden sm:table-cell">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium hidden lg:table-cell">State</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                  {isAdmin() && <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{u.full_name}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-500">{u.email}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-500">{u.phone || '—'}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-500">{u.state_of_residence || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="py-3 px-4">
                        <select
                          className="text-xs border rounded px-2 py-1"
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                        >
                          <option value="member">Member</option>
                          <option value="exco">EXCO</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
            <FiUsers className="inline mr-1" /> {users.length} members
          </div>
        </div>
      )}
    </div>
  );
}
