import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
}

export default function UsersIndex({ users, roles }: { users: UserRow[]; roles: Record<string, string> }) {
    return (
        <AdminLayout
            title="Pengguna"
            description="Kelola akses admin. Peran menentukan menu dan tindakan yang dapat dilakukan."
            actions={
                <Button asChild className="rounded-xl">
                    <Link href="/admin/users/create">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Pengguna baru
                    </Link>
                </Button>
            }
            breadcrumbs={[{ label: 'Pengguna' }]}
        >
            <Panel bodyClassName="p-0">
                <div className="overflow-x-auto">
                    <table className="table-shell">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Peran</th>
                                <th>Status</th>
                                <th>Login terakhir</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <Link href={`/admin/users/${user.id}/edit`} className="font-medium text-navy hover:text-brand-700">
                                            {user.name}
                                        </Link>
                                        <span className="block text-xs text-muted-foreground">{user.email}</span>
                                    </td>
                                    <td className="text-xs text-ink">{roles[user.role] ?? user.role_label}</td>
                                    <td>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${
                                                user.is_active ? 'bg-success/10 text-success ring-success/20' : 'bg-slate-100 text-slate-500 ring-slate-200'
                                            }`}
                                        >
                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(user.last_login_at) || 'Belum pernah'}</td>
                                    <td>
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                Edit
                                            </Link>
                                            <ConfirmDelete
                                                url={`/admin/users/${user.id}`}
                                                title="Hapus pengguna ini?"
                                                description={`Akun “${user.name}” akan dihapus permanen dan tidak bisa masuk lagi.`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            <Panel className="mt-5" title="Matriks peran" bodyClassName="p-5">
                <div className="overflow-x-auto">
                    <table className="table-shell">
                        <thead>
                            <tr>
                                <th>Peran</th>
                                <th>Konten</th>
                                <th>Leads</th>
                                <th>Pengaturan</th>
                                <th>Pengguna</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-medium text-navy">Super Admin</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Admin</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Content Manager</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Sales</td>
                                <td>Tidak</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Panel>
        </AdminLayout>
    );
}
