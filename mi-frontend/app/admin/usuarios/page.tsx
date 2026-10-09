'use client'
import { useState, useEffect } from 'react'
import { Trash2, Shield, UserPlus, X, ToggleLeft, ToggleRight, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { User, Role } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  ADMIN:  'bg-purple-50 text-purple-700 border border-purple-200',
  AGENT:  'bg-sky-50 text-sky-700 border border-sky-200',
  CLIENT: 'bg-slate-50 text-slate-600 border border-slate-200',
}

// ── Modal agregar usuario ──────────────────────────────────
function AddUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'CLIENT' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.adminCreate(form)
      toast.success('Usuario creado')
      onSaved()
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Nuevo usuario</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-body mb-1 block">Nombre</label>
              <input className="input w-full" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-body mb-1 block">Apellido</label>
              <input className="input w-full" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-body mb-1 block">Email</label>
            <input type="email" className="input w-full" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-body mb-1 block">Contraseña</label>
            <input type="password" className="input w-full" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-body mb-1 block">Teléfono</label>
            <input className="input w-full" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-body mb-1 block">Rol</label>
            <select className="input w-full" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="CLIENT">Cliente</option>
              <option value="AGENT">Agente</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal detalle usuario ──────────────────────────────────
function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Detalle de usuario</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
            {user.firstName[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg font-display">{user.firstName} {user.lastName}</p>
            <p className="text-slate-500 text-sm font-body">{user.email}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm font-body">
          {[
            ['Teléfono', user.phone ?? '—'],
            ['Rol', user.role],
            ['Estado', user.isActive ? 'Activo' : 'Inactivo'],
            ['Registro', formatDate(user.createdAt, 'dd MMM yyyy')],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">{label}</span>
              <span className="font-semibold text-slate-700">{value}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]         = useState<User[]>([])
  const [meta, setMeta]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [showAdd, setShowAdd]     = useState(false)
  const [detail, setDetail]       = useState<User | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await usersApi.adminList({ page, limit: 15, role: roleFilter || undefined })
      setUsers(data.users)
      setMeta(data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  // ── Cambiar rol ──────────────────────────────────────────
  const handleRoleChange = async (id: string, role: string) => {
    try {
      await usersApi.adminUpdate(id, { role } as any)
      toast.success('Rol actualizado')
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as Role } : u))
    } catch (err: any) { toast.error(err.message) }
  }

  // ── Activar / desactivar ─────────────────────────────────
  const handleToggleActive = async (u: User) => {
    try {
      await usersApi.adminUpdate(u.id, { isActive: !u.isActive } as any)
      toast.success(u.isActive ? 'Usuario desactivado' : 'Usuario activado')
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !u.isActive } : x))
    } catch (err: any) { toast.error(err.message) }
  }

  // ── Eliminar ─────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    try {
      await usersApi.adminRemove(id)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 font-body mt-1">{meta?.total ?? 0} usuarios registrados</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Filtro */}
      <div className="card p-4 mb-6">
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as any); setPage(1) }} className="input max-w-[200px]">
          <option value="">Todos los roles</option>
          <option value="CLIENT">Clientes</option>
          <option value="AGENT">Agentes</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-4 font-semibold">Usuario</th>
                <th className="px-5 py-4 font-semibold">Teléfono</th>
                <th className="px-5 py-4 font-semibold">Rol</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Registro</th>
                <th className="px-5 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4">
                    <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                  </td></tr>
                ))
                : users.map(u => (
                  <tr key={u.id} className="hover:bg-sky-50/30 transition-colors">
                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="px-5 py-4 text-slate-600">{u.phone ?? '—'}</td>

                    {/* Rol — selector inline */}
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg border cursor-pointer outline-none ${ROLE_COLORS[u.role]}`}
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="AGENT">AGENT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Estado — toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                          u.isActive
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}
                      >
                        {u.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    {/* Registro */}
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {formatDate(u.createdAt, 'dd MMM yyyy')}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetail(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
                          title="Ver detalle"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-body">Página {meta.page} de {meta.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs py-1.5 disabled:opacity-40">Anterior</button>
              <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs py-1.5 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchUsers() }} />}
      {detail   && <UserDetailModal user={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}