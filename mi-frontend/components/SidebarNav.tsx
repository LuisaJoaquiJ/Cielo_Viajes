'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Plane,
  Search,
  Send,
  UserPlus,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

const sidebarCss = `
.cielo-menu-button{
  position:fixed;top:14px;left:16px;z-index:100000;width:48px;height:48px;
  border-radius:16px;border:1px solid rgba(0,229,255,.35);
  background:linear-gradient(135deg,rgba(0,229,255,.95),rgba(0,153,255,.95));
  color:#04060E;display:flex;align-items:center;justify-content:center;
  box-shadow:0 16px 36px rgba(0,229,255,.24),0 8px 28px rgba(0,0,0,.32);cursor:pointer;
  transition:transform .2s ease,background .2s ease,color .2s ease;
}
.cielo-menu-button:hover{transform:translateY(-1px);box-shadow:0 18px 42px rgba(0,229,255,.34),0 8px 28px rgba(0,0,0,.38)}
.cielo-menu-button.is-open{background:#07101d;color:white;border-color:rgba(255,255,255,.16)}
.cielo-backdrop{
  position:fixed;inset:0;z-index:99997;background:rgba(4,6,14,.68);
  backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .25s ease;
}
.cielo-backdrop.is-open{opacity:1;pointer-events:auto}
.cielo-sidebar{
  position:fixed;top:0;left:0;z-index:99998;width:336px;max-width:calc(100vw - 22px);
  height:100vh;background:#07101d;display:flex;flex-direction:column;overflow:hidden;
  border-right:1px solid rgba(255,255,255,.1);
  box-shadow:22px 0 80px rgba(0,0,0,.5),0 0 70px rgba(0,229,255,.08);transform:translateX(-104%);
  transition:transform .28s cubic-bezier(.16,1,.3,1);
}
.cielo-sidebar.is-open{transform:translateX(0)}
.cielo-side-head{
  position:relative;overflow:hidden;background:
    radial-gradient(circle at 85% 15%,rgba(255,122,92,.26),transparent 34%),
    radial-gradient(circle at 15% 100%,rgba(168,224,99,.18),transparent 35%),
    linear-gradient(135deg,#07101d 0%,#08243a 52%,#04060E 100%);
  padding:26px 20px 22px 78px;color:white;min-height:118px;flex-shrink:0;
  border-bottom:1px solid rgba(255,255,255,.1);
}
.cielo-side-head::before{content:"";position:absolute;width:170px;height:170px;border-radius:999px;right:-72px;top:-78px;background:rgba(0,229,255,.18);filter:blur(6px)}
.cielo-side-head::after{content:"";position:absolute;left:78px;right:20px;bottom:0;height:1px;background:linear-gradient(90deg,#00E5FF,transparent)}
.cielo-brand-title{position:relative;font-size:22px;line-height:1;font-weight:900;letter-spacing:-.02em}
.cielo-brand-sub{position:relative;margin-top:8px;font-size:13px;color:rgba(255,255,255,.66);font-weight:600;line-height:1.45}
.cielo-side-body{flex:1;overflow-y:auto;padding:14px;background:
  linear-gradient(180deg,#07101d 0%,#061421 48%,#04060E 100%)}
.cielo-side-body::-webkit-scrollbar{width:6px}
.cielo-side-body::-webkit-scrollbar-track{background:#04060E}
.cielo-side-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:99px}
.cielo-side-card{
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
  border-radius:18px;padding:14px;
  box-shadow:0 18px 42px rgba(0,0,0,.2);margin-bottom:12px;
}
.cielo-side-label{
  display:flex;align-items:center;gap:8px;margin-bottom:12px;color:rgba(255,255,255,.42);
  font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;
}
.cielo-search-row{display:flex;gap:8px}
.cielo-input{
  width:100%;height:44px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.24);
  padding:0 12px;color:white;font-size:14px;font-weight:600;outline:none;
  transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;
}
.cielo-input::placeholder{color:rgba(255,255,255,.32)}
.cielo-input:focus{border-color:rgba(0,229,255,.55);background:rgba(0,229,255,.045);box-shadow:0 0 0 4px rgba(0,229,255,.12)}
.cielo-search-button{
  width:46px;height:44px;flex-shrink:0;border:0;border-radius:13px;color:#04060E;cursor:pointer;
  background:linear-gradient(135deg,#00E5FF,#0099FF);display:flex;align-items:center;justify-content:center;
  box-shadow:0 12px 26px rgba(0,229,255,.24);transition:transform .18s ease,opacity .18s ease;
}
.cielo-search-button:hover{transform:translateY(-1px)}
.cielo-search-button:disabled{opacity:.45;cursor:not-allowed;transform:none}
.cielo-nav-list{display:flex;flex-direction:column;gap:4px}
.cielo-nav-link{
  display:flex;align-items:center;gap:12px;border-radius:14px;padding:10px 9px;
  color:rgba(255,255,255,.76);text-decoration:none;font-size:15px;font-weight:800;transition:background .18s ease,color .18s ease,transform .18s ease;
}
.cielo-nav-link:hover{background:rgba(255,255,255,.07);color:white;transform:translateX(2px)}
.cielo-nav-icon{
  width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.cielo-nav-link:nth-child(1) .cielo-nav-icon{background:rgba(0,229,255,.13);color:#00E5FF}
.cielo-nav-link:nth-child(2) .cielo-nav-icon{background:rgba(168,224,99,.13);color:#A8E063}
.cielo-nav-link:nth-child(3) .cielo-nav-icon{background:rgba(255,122,92,.14);color:#FF7A5C}
.cielo-nav-link:nth-child(4) .cielo-nav-icon{background:rgba(255,212,126,.14);color:#FFD47E}
.cielo-mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cielo-mini-stat{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);border-radius:14px;padding:10px 8px;text-align:center}
.cielo-mini-stat strong{display:block;color:white;font-size:16px;line-height:1;font-weight:950}
.cielo-mini-stat span{display:block;margin-top:5px;color:rgba(255,255,255,.38);font-size:10px;font-weight:800;line-height:1.2}
.cielo-socials{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cielo-social{
  height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:white;
  text-decoration:none;font-size:14px;font-weight:900;transition:transform .18s ease,filter .18s ease;
}
.cielo-social:hover{transform:translateY(-2px);filter:saturate(1.1)}
.cielo-contact-form{display:flex;flex-direction:column;gap:8px}
.cielo-submit{
  height:44px;border:0;border-radius:13px;background:linear-gradient(135deg,#00E5FF,#0099FF);
  color:#04060E;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 12px 24px rgba(0,229,255,.24);transition:transform .18s ease,opacity .18s ease;
}
.cielo-submit:hover{transform:translateY(-1px)}
.cielo-submit:disabled{opacity:.48;cursor:not-allowed;transform:none}
.cielo-error{font-size:12px;color:#fb7185;font-weight:700}
.cielo-success{border-radius:16px;background:rgba(45,212,191,.12);border:1px solid rgba(45,212,191,.24);padding:18px;text-align:center;color:#5eead4}
.cielo-side-foot{border-top:1px solid rgba(255,255,255,.1);background:#04060E;padding:12px 16px;text-align:center;color:rgba(255,255,255,.34);font-size:12px;font-weight:700}
@media (max-width:420px){
  .cielo-sidebar{width:calc(100vw - 18px)}
  .cielo-side-head{padding-left:76px}
}
`

function IconInstagramSmall() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, fill: 'currentColor' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function IconFacebookSmall() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, fill: 'currentColor' }}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function IconTikTokSmall() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, fill: 'currentColor' }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z" />
    </svg>
  )
}

const links = [
  { href: '/viajes', label: 'Viajes', icon: Plane },
  { href: '/destinos', label: 'Destinos', icon: MapPin },
  { href: '/#nosotros', label: 'Conocenos', icon: Heart },
]

export function SidebarNav() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleSearch() {
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/viajes?search=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) return

    setSending(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: contactName.trim(),
          telefono: contactPhone.trim(),
          email: contactEmail.trim(),
          destino: searchQuery.trim() || 'Contacto rapido',
        }),
      })

      if (!response.ok) throw new Error('No se pudo enviar')

      setSent(true)
      setContactName('')
      setContactPhone('')
      setContactEmail('')
      setTimeout(() => setSent(false), 3200)
    } catch {
      setError('No pudimos enviar el mensaje. Intentalo otra vez.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sidebarCss }} />

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
        className={`cielo-menu-button ${open ? 'is-open' : ''}`}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>

      <div onClick={() => setOpen(false)} className={`cielo-backdrop ${open ? 'is-open' : ''}`} />

      <aside className={`cielo-sidebar ${open ? 'is-open' : ''}`}>
        <div className="cielo-side-head">
          <div className="cielo-brand-title">Cielo Viajes</div>
          <div className="cielo-brand-sub">Planes claros, soporte real y destinos memorables.</div>
        </div>

        <div className="cielo-side-body">
          <section className="cielo-side-card">
            <div className="cielo-mini-grid">
              <div className="cielo-mini-stat">
                <strong>200+</strong>
                <span>viajes</span>
              </div>
              <div className="cielo-mini-stat">
                <strong>50+</strong>
                <span>destinos</span>
              </div>
              <div className="cielo-mini-stat">
                <strong>98%</strong>
                <span>felices</span>
              </div>
            </div>
          </section>

          <section className="cielo-side-card">
            <div className="cielo-side-label"><Search size={14} /> Buscar viaje</div>
            <div className="cielo-search-row">
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && handleSearch()}
                placeholder="A donde vas?"
                className="cielo-input"
              />
              <button type="button" onClick={handleSearch} disabled={!searchQuery.trim()} className="cielo-search-button">
                <Search size={18} />
              </button>
            </div>
          </section>

          <section className="cielo-side-card">
            <div className="cielo-side-label"><Plane size={14} /> Explorar</div>
            <div className="cielo-nav-list">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="cielo-nav-link">
                  <span className="cielo-nav-icon"><Icon size={17} /></span>
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="cielo-side-card">
            <div className="cielo-side-label"><User size={14} /> Mi Cuenta</div>
            <div className="cielo-nav-list">
              {isAuthenticated ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 9px', borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 6 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '55px',
                      background: 'linear-gradient(135deg, #00E5FF, #0099FF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#04060E',
                      fontSize: 12,
                      fontWeight: 800,
                    }}>
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.44)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                    </div>
                  </div>
                  <Link href="/mi-cuenta" onClick={() => setOpen(false)} className="cielo-nav-link">
                    <span className="cielo-nav-icon" style={{ background: 'rgba(0,229,255,.13)', color: '#00E5FF' }}><User size={16} /></span>
                    Mi perfil
                  </Link>
                  <Link href="/mi-cuenta/reservas" onClick={() => setOpen(false)} className="cielo-nav-link">
                    <span className="cielo-nav-icon" style={{ background: 'rgba(168,224,99,.13)', color: '#A8E063' }}><LayoutDashboard size={16} /></span>
                    Mis reservas
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="cielo-nav-link">
                      <span className="cielo-nav-icon" style={{ background: 'rgba(255,212,126,.14)', color: '#FFD47E' }}><LayoutDashboard size={16} /></span>
                      Panel admin
                    </Link>
                  )}
                  {user?.role === 'AGENT' && (
                    <Link href="/agente" onClick={() => setOpen(false)} className="cielo-nav-link">
                      <span className="cielo-nav-icon" style={{ background: 'rgba(255,212,126,.14)', color: '#FFD47E' }}><LayoutDashboard size={16} /></span>
                      Panel agente
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                      router.push('/')
                    }}
                    className="cielo-nav-link"
                    style={{ width: '100%', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="cielo-nav-icon" style={{ background: 'rgba(255,122,92,.14)', color: '#FF7A5C' }}><LogOut size={16} /></span>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="cielo-nav-link">
                    <span className="cielo-nav-icon" style={{ background: 'rgba(0,229,255,.13)', color: '#00E5FF' }}><User size={16} /></span>
                    Iniciar sesión
                  </Link>
                  <Link href="/registro" onClick={() => setOpen(false)} className="cielo-nav-link">
                    <span className="cielo-nav-icon" style={{ background: 'rgba(168,224,99,.13)', color: '#A8E063' }}><UserPlus size={16} /></span>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </section>

          <section className="cielo-side-card">
            <div className="cielo-side-label"><Heart size={14} /> Siguenos</div>
            <div className="cielo-socials">
              <a href="https://instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="cielo-social" style={{ background: 'linear-gradient(135deg,#f43f5e,#a855f7,#f97316)' }} aria-label="Instagram">
                <IconInstagramSmall />
              </a>
              <a href="https://tiktok.com/@TU_USUARIO" target="_blank" rel="noopener noreferrer" className="cielo-social" style={{ background: '#0f172a' }} aria-label="TikTok">
                <IconTikTokSmall />
              </a>
              <a href="https://facebook.com/TU_PAGINA" target="_blank" rel="noopener noreferrer" className="cielo-social" style={{ background: '#2563eb' }} aria-label="Facebook">
                <IconFacebookSmall />
              </a>
            </div>
          </section>

          <section className="cielo-side-card">
            <div className="cielo-side-label"><Mail size={14} /> Contacto rapido</div>
            {sent ? (
              <div className="cielo-success">
                <CheckCircle size={34} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 900 }}>Mensaje enviado</div>
                <div style={{ marginTop: 3, fontSize: 12 }}>Te contactamos pronto.</div>
              </div>
            ) : (
              <form onSubmit={handleContact} className="cielo-contact-form">
                <input value={contactName} onChange={event => setContactName(event.target.value)} placeholder="Tu nombre" className="cielo-input" />
                <input value={contactPhone} onChange={event => setContactPhone(event.target.value)} placeholder="Tu telefono" className="cielo-input" />
                <input value={contactEmail} onChange={event => setContactEmail(event.target.value)} placeholder="Tu correo" type="email" className="cielo-input" />
                {error && <p className="cielo-error">{error}</p>}
                <button type="submit" disabled={sending || !contactName.trim() || !contactPhone.trim() || !contactEmail.trim()} className="cielo-submit">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </section>
        </div>

        <div className="cielo-side-foot">© 2026 Cielo Viajes</div>
      </aside>
    </>
  )
}
