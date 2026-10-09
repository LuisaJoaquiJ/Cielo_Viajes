'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, ChevronRight, Star, Heart,
  Sparkles, Shield, Award, CalendarCheck, Plane,
  User, LogOut, LayoutDashboard, ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SidebarNav }    from '@/components/SidebarNav'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { ChatBot }        from '@/components/ChatBot'
import { formatCurrency } from '@/lib/utils'
import type { Trip } from '@/types'
import { useAuthStore } from '@/store/auth.store'

/* ─── TYPES ──────────────────────────────────────────────────────────── */
type DestinationData = {
  title: string; location: string; days: number; price: string
  rating: number; tag: string; accent: string; bg: string; slug: string
}
type StatItem    = { value: number; suffix: string; label: string }
type FeatureItem = { Icon: LucideIcon; title: string; text: string; accent: string }

/* ─── DATA ───────────────────────────────────────────────────────────── */
const FALLBACK_DESTINATIONS: DestinationData[] = [
  { title: 'Cartagena Sunset Escape', location: 'Cartagena, Colombia', days: 4, price: '$ 1.290.000', rating: 4.9, tag: 'Playas & Ciudad', accent: '#FF7A5C', bg: 'https://images.unsplash.com/photo-1583997052301-0042b33fc598?w=700&q=80', slug: 'cartagena-sunset-escape' },
  { title: 'San Andrés Blue Week',    location: 'San Andrés, Colombia', days: 5, price: '$ 1.780.000', rating: 4.8, tag: 'Mar de 7 colores',  accent: '#00D4FF', bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80', slug: 'san-andres-blue-week' },
  { title: 'Eje Cafetero Premium',    location: 'Quindío, Colombia',    days: 3, price: '$ 890.000',   rating: 4.7, tag: 'Naturaleza & Café', accent: '#A8E063', bg: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=700&q=80', slug: 'eje-cafetero-premium' },
  { title: 'Santa Marta Tayrona',     location: 'Magdalena, Colombia',  days: 4, price: '$ 1.150.000', rating: 4.8, tag: 'Selva & Playa',     accent: '#FFD47E', bg: 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?w=700&q=80', slug: 'santa-marta-tayrona' },
]

const STATS: StatItem[] = [
  { value: 200, suffix: '+', label: 'Viajes realizados' },
  { value: 50,  suffix: '+', label: 'Destinos' },
  { value: 98,  suffix: '%', label: 'Clientes felices' },
  { value: 5,   suffix: '★', label: 'Calificación' },
]

const FEATURES: FeatureItem[] = [
  { Icon: CalendarCheck, title: 'Reserva y relájate',  text: 'Organizamos fechas, cupos y plan para que viajes sin estrés.', accent: '#00E5FF' },
  { Icon: Shield,        title: 'Checklist seguro',    text: 'Validamos cada detalle antes de confirmar tu aventura.',      accent: '#FF7A5C' },
  { Icon: Award,         title: 'Ahorra más',          text: 'Buscamos opciones con el mejor precio y experiencia total.',  accent: '#A8E063' },
]

const TICKER  = ['Cartagena','San Andrés','Medellín','Tayrona','Islas del Rosario','Santa Marta','Bogotá','Eje Cafetero','Amazonas']
const ACCENTS = ['#00E5FF','#FF7A5C','#A8E063','#FFD47E'] as const

const GEO_CONTINENTS: Record<string, [number, number][]> = {
  northAmerica: [[-168,71],[-140,70],[-100,73],[-85,70],[-60,63],[-55,47],[-65,43],[-70,42],[-75,38],[-80,25],[-88,15],[-83,10],[-90,15],[-105,20],[-110,28],[-117,32],[-120,38],[-124,46],[-130,55],[-135,57],[-140,60],[-155,60],[-165,64],[-168,71]],
  southAmerica: [[-72,12],[-60,10],[-50,5],[-35,-5],[-35,-10],[-40,-20],[-50,-30],[-65,-35],[-70,-40],[-75,-50],[-70,-55],[-65,-55],[-60,-52],[-55,-34],[-48,-28],[-40,-20],[-35,-8],[-50,2],[-60,8],[-72,12]],
  europe: [[-10,35],[-5,36],[0,38],[5,43],[10,44],[15,44],[20,45],[25,42],[30,42],[35,37],[28,38],[28,41],[30,46],[25,50],[20,54],[15,56],[10,58],[5,59],[0,58],[-5,48],[-10,52],[-10,44],[-10,35]],
  africa: [[-17,15],[-15,10],[-15,5],[-10,5],[-5,5],[0,5],[5,5],[10,5],[15,5],[20,5],[25,0],[30,-5],[35,-10],[40,-10],[42,12],[43,15],[40,20],[38,22],[37,25],[35,30],[33,32],[30,32],[25,30],[20,30],[15,25],[10,20],[5,15],[0,15],[-5,10],[-10,10],[-15,15],[-17,15]],
  asia: [[26,42],[30,46],[35,47],[40,44],[45,42],[50,40],[55,37],[60,35],[65,34],[70,38],[75,37],[80,35],[85,28],[90,28],[95,25],[100,20],[105,15],[110,10],[115,5],[120,5],[125,10],[130,15],[135,35],[140,40],[142,46],[140,52],[135,55],[130,60],[125,63],[120,65],[115,62],[110,55],[105,50],[100,55],[95,58],[90,60],[85,62],[80,65],[75,68],[70,70],[65,68],[60,62],[55,55],[50,52],[45,48],[40,46],[35,47],[30,46],[26,42]],
  australia: [[114,-22],[116,-20],[120,-18],[125,-14],[130,-12],[135,-12],[138,-15],[142,-12],[148,-18],[153,-27],[153,-32],[150,-38],[145,-38],[140,-36],[135,-35],[130,-32],[125,-30],[118,-26],[114,-22]],
  greenland: [[-45,83],[-30,83],[-20,78],[-18,70],[-20,65],[-25,62],[-30,60],[-40,62],[-50,67],[-53,72],[-53,78],[-45,83]],
  antarctica: [[-170,-72],[-125,-76],[-70,-74],[-20,-76],[35,-73],[92,-76],[150,-72],[175,-78],[120,-84],[50,-86],[-30,-84],[-105,-83],[-170,-78],[-170,-72]],
}

const GEO_CITIES = [
  { lon: -74.08, lat: 4.71, name: 'Bogota', size: 4, home: true },
  { lon: -73.98, lat: 40.75, name: 'Nueva York', size: 3, home: false },
  { lon: -43.17, lat: -22.9, name: 'Rio', size: 3, home: false },
  { lon: 2.35, lat: 48.85, name: 'Paris', size: 3, home: false },
  { lon: -0.12, lat: 51.5, name: 'Londres', size: 3, home: false },
  { lon: 28.98, lat: 41.01, name: 'Estambul', size: 2, home: false },
  { lon: 55.3, lat: 25.2, name: 'Dubai', size: 3, home: false },
  { lon: 103.82, lat: 1.35, name: 'Singapur', size: 3, home: false },
  { lon: 139.69, lat: 35.69, name: 'Tokio', size: 4, home: false },
  { lon: 151.21, lat: -33.87, name: 'Sidney', size: 3, home: false },
  { lon: -58.38, lat: -34.61, name: 'Buenos Aires', size: 3, home: false },
  { lon: -99.13, lat: 19.43, name: 'Mexico DF', size: 3, home: false },
  { lon: -46.63, lat: -23.55, name: 'Sao Paulo', size: 3, home: false },
  { lon: 37.62, lat: 55.75, name: 'Moscu', size: 3, home: false },
]

const GEO_ROUTES = [
  ['Bogota', 'Nueva York'], ['Bogota', 'Paris'], ['Bogota', 'Buenos Aires'],
  ['Nueva York', 'Londres'], ['Londres', 'Dubai'], ['Dubai', 'Singapur'],
  ['Singapur', 'Tokio'], ['Tokio', 'Sidney'], ['Moscu', 'Tokio'],
  ['Paris', 'Estambul'], ['Estambul', 'Dubai'], ['Sao Paulo', 'Buenos Aires'],
] as [string, string][]

function geoToPoint(lon: number, lat: number, rotation: number, cx: number, cy: number, radius: number) {
  const lonRad = ((lon + rotation) * Math.PI) / 180
  const latRad = (lat * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(latRad) * Math.sin(lonRad),
    y: cy - radius * Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad),
  }
}

function HeroEarthBackground() {
  return <div className="hero-earth-bg" aria-hidden="true" />
}

// Conservado como fallback visual si se quiere volver al mapa SVG anterior.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroGlobeBackground() {
  const cx = 600
  const cy = 355
  const radius = 248
  const mapWidth = 590
  const mapHeight = 368
  const mapLeft = cx - mapWidth / 2
  const toSvgPoint = (lon: number, lat: number, offset = 0) => ({
    x: mapLeft + ((lon + 180) / 360) * mapWidth + offset,
    y: cy - (lat / 180) * mapHeight,
  })
  const continentPath = (coords: [number, number][]) => {
    return coords.map(([lon, lat], index) => {
      const point = toSvgPoint(lon, lat)
      return `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    }).join(' ') + ' Z'
  }
  const routePath = (fromName: string, toName: string, offset = 0) => {
    const fromCity = GEO_CITIES.find(city => city.name === fromName)
    const toCity = GEO_CITIES.find(city => city.name === toName)
    if (!fromCity || !toCity) return ''
    const from = toSvgPoint(fromCity.lon, fromCity.lat, offset)
    const to = toSvgPoint(toCity.lon, toCity.lat, offset)
    const middleX = (from.x + to.x) / 2
    const middleY = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.hypot(dx, dy)
    const controlX = middleX - dy * 0.16
    const controlY = middleY + dx * 0.16 - distance * 0.16
    return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
  }

  return (
    <div className="hero-globe-bg" aria-hidden="true">
      <svg className="hero-network-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="geoGlobeGlow" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#0B2A48" />
            <stop offset="58%" stopColor="#06192D" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <filter id="geoGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="geoClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
          <symbol id="geo-plane" viewBox="-26 -14 52 28">
            <path d="M25 0 L-20 -13 L-11 -2 L-25 -1 L-25 1 L-11 2 L-20 13 Z" />
          </symbol>
        </defs>
        <rect width="1200" height="800" fill="#04060E" />
        <circle cx={cx} cy={cy} r="390" fill="rgba(0,229,255,.07)" />
        <circle cx={cx} cy={cy} r={radius} fill="url(#geoGlobeGlow)" />
        <g clipPath="url(#geoClip)">
          <g className="geo-map-loop">
            {[0, mapWidth].map(offset => (
              <g key={`loop-${offset}`} transform={`translate(${offset} 0)`}>
                <g className="geo-grid" fill="none">
                  {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map(lat => (
                    <path
                      key={`lat-${offset}-${lat}`}
                      d={Array.from({ length: 73 }).map((_, index) => {
                        const point = toSvgPoint(-180 + index * 5, lat)
                        return `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
                      }).join(' ')}
                    />
                  ))}
                  {Array.from({ length: 19 }).map((_, index) => {
                    const lon = -180 + index * 20
                    return (
                      <path
                        key={`lon-${offset}-${lon}`}
                        d={Array.from({ length: 37 }).map((__, latIndex) => {
                          const point = toSvgPoint(lon, -90 + latIndex * 5)
                          return `${latIndex === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
                        }).join(' ')}
                      />
                    )
                  })}
                </g>
                <g className="geo-land">
                  {Object.entries(GEO_CONTINENTS).map(([name, coords], index) => (
                    <path key={`${offset}-${name}`} d={continentPath(coords)} className={index % 2 === 0 ? 'geo-land-a' : 'geo-land-b'} />
                  ))}
                </g>
                <g className="geo-lights">
                  {Object.entries(GEO_CONTINENTS).flatMap(([name, coords]) =>
                    coords.map(([lon, lat], index) => {
                      const point = toSvgPoint(lon, lat)
                      return <circle key={`${offset}-${name}-${index}`} cx={point.x} cy={point.y} r={index % 4 === 0 ? 2 : 1.25} style={{ animationDelay: `${(index % 8) * 0.18}s` }} />
                    })
                  )}
                  {GEO_CITIES.map(city => {
                    const point = toSvgPoint(city.lon, city.lat)
                    return <circle key={`${offset}-${city.name}`} cx={point.x} cy={point.y} r={city.home ? 4.5 : 3} className={city.home ? 'geo-home-city' : 'geo-city'} />
                  })}
                </g>
                <g className="geo-routes" fill="none" filter="url(#geoGlow)">
                  {GEO_ROUTES.slice(0, 8).map(([from, to]) => <path key={`${offset}-${from}-${to}`} d={routePath(from, to)} />)}
                </g>
              </g>
            ))}
          </g>
          <g className="geo-planes">
            {GEO_ROUTES.slice(0, 6).map(([from, to], index) => {
              const pathId = `geo-route-${index}`
              const d = routePath(from, to)
              return (
                <g key={pathId}>
                  <path id={pathId} d={d} fill="none" opacity="0" />
                  <g>
                    <animateMotion dur={`${7 + (index % 6) * 1.4}s`} begin={`${index * 0.55}s`} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                    <use href="#geo-plane" x="-13" y="-7" width="26" height="14" fill={index % 2 === 0 ? '#FFFFFF' : '#A8E063'} />
                  </g>
                </g>
              )
            })}
          </g>
          <g style={{ display: 'none' }}>
            {false && (
              <>
                <path
                  d=""
                />
              </>
            )}
          </g>
        </g>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(0,229,255,.52)" strokeWidth="1.6" filter="url(#geoGlow)" />
        <circle cx={cx} cy={cy} r={radius + 22} fill="none" stroke="rgba(0,180,255,.12)" strokeWidth="22" />
      </svg>
      <div className="hero-globe-overlay" />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroGlobeCanvasFallback() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.offsetWidth || window.innerWidth
      const height = canvas.offsetHeight || window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const cityByName = (name: string) => GEO_CITIES.find(city => city.name === name)
    const planes = GEO_ROUTES.map((route, index) => ({
      route,
      t: Math.random(),
      speed: 0.00055 + Math.random() * 0.00045,
      color: index % 3 === 0 ? '#FFFFFF' : index % 3 === 1 ? '#A8E063' : '#FFD47E',
    }))
    let rotation = -74

    const drawPlane = (x: number, y: number, angle: number, scale: number, color: string, alpha: number) => {
      context.save()
      context.translate(x, y)
      context.rotate(angle)
      context.globalAlpha = alpha
      context.shadowBlur = 14
      context.shadowColor = color === '#FFFFFF' ? 'rgba(0,229,255,.85)' : color
      context.fillStyle = color
      context.beginPath()
      context.moveTo(10 * scale, 0)
      context.lineTo(-8 * scale, -5 * scale)
      context.lineTo(-5 * scale, -1 * scale)
      context.lineTo(-11 * scale, -1 * scale)
      context.lineTo(-11 * scale, 1 * scale)
      context.lineTo(-5 * scale, 1 * scale)
      context.lineTo(-8 * scale, 5 * scale)
      context.closePath()
      context.fill()
      context.restore()
    }

    const draw = (timestamp: number) => {
      const width = canvas.offsetWidth || window.innerWidth
      const height = canvas.offsetHeight || window.innerHeight
      const cx = width * 0.5
      const cy = height * 0.46
      const radius = Math.min(width, height) * (width < 700 ? 0.39 : 0.34)

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#04060E'
      context.fillRect(0, 0, width, height)

      const ambient = context.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.8)
      ambient.addColorStop(0, 'rgba(0,100,200,.18)')
      ambient.addColorStop(0.55, 'rgba(0,229,255,.07)')
      ambient.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = ambient
      context.beginPath()
      context.arc(cx, cy, radius * 1.8, 0, Math.PI * 2)
      context.fill()

      const ocean = context.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, 8, cx, cy, radius)
      ocean.addColorStop(0, '#0B2A48')
      ocean.addColorStop(0.58, '#06192D')
      ocean.addColorStop(1, '#020810')
      context.fillStyle = ocean
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.fill()

      context.save()
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.clip()

      context.strokeStyle = 'rgba(189,244,255,.13)'
      context.lineWidth = 0.75
      for (let lat = -80; lat <= 80; lat += 20) {
        context.beginPath()
        let started = false
        for (let lon = -180; lon <= 180; lon += 4) {
          const point = geoToPoint(lon, lat, rotation, cx, cy, radius)
          if (point.z <= 0) { started = false; continue }
          if (started) context.lineTo(point.x, point.y)
          else { context.moveTo(point.x, point.y); started = true }
        }
        context.stroke()
      }
      for (let lon = -180; lon <= 180; lon += 20) {
        context.beginPath()
        let started = false
        for (let lat = -90; lat <= 90; lat += 4) {
          const point = geoToPoint(lon, lat, rotation, cx, cy, radius)
          if (point.z <= 0) { started = false; continue }
          if (started) context.lineTo(point.x, point.y)
          else { context.moveTo(point.x, point.y); started = true }
        }
        context.stroke()
      }

      Object.entries(GEO_CONTINENTS).forEach(([, coordinates], continentIndex) => {
        const points = coordinates.map(([lon, lat]) => geoToPoint(lon, lat, rotation, cx, cy, radius))
        if (!points.some(point => point.z > 0)) return
        context.beginPath()
        let started = false
        points.forEach(point => {
          if (point.z <= 0) { started = false; return }
          if (started) context.lineTo(point.x, point.y)
          else { context.moveTo(point.x, point.y); started = true }
        })
        context.closePath()
        context.shadowBlur = 18
        context.shadowColor = continentIndex % 2 === 0 ? 'rgba(0,229,255,.38)' : 'rgba(168,224,99,.18)'
        context.fillStyle = continentIndex % 2 === 0 ? 'rgba(0,194,255,.15)' : 'rgba(45,212,191,.13)'
        context.strokeStyle = 'rgba(189,244,255,.58)'
        context.lineWidth = 1.4
        context.fill()
        context.stroke()
        context.shadowBlur = 0

        coordinates.forEach(([lon, lat], dotIndex) => {
          const point = geoToPoint(lon, lat, rotation, cx, cy, radius)
          if (point.z <= 0.04) return
          const pulse = (Math.sin(timestamp * 0.003 + dotIndex) + 1) / 2
          context.fillStyle = `rgba(189,244,255,${0.35 + pulse * 0.45})`
          context.shadowBlur = 8
          context.shadowColor = 'rgba(0,229,255,.75)'
          context.beginPath()
          context.arc(point.x, point.y, (dotIndex % 4 === 0 ? 1.9 : 1.25) * (radius / 210), 0, Math.PI * 2)
          context.fill()
          context.shadowBlur = 0
        })
      })

      GEO_ROUTES.forEach(([fromName, toName]) => {
        const fromCity = cityByName(fromName)
        const toCity = cityByName(toName)
        if (!fromCity || !toCity) return
        const from = geoToPoint(fromCity.lon, fromCity.lat, rotation, cx, cy, radius)
        const to = geoToPoint(toCity.lon, toCity.lat, rotation, cx, cy, radius)
        if (from.z < 0.02 && to.z < 0.02) return
        const alpha = Math.max(0.05, Math.min(from.z, to.z, 1))
        const middleX = (from.x + to.x) / 2
        const middleY = (from.y + to.y) / 2
        const dx = to.x - from.x
        const dy = to.y - from.y
        const distance = Math.hypot(dx, dy)
        const controlX = middleX - dy * 0.24
        const controlY = middleY + dx * 0.24 - distance * 0.12
        context.setLineDash([6, 10])
        context.strokeStyle = `rgba(0,229,255,${alpha * 0.28})`
        context.lineWidth = 1
        context.shadowBlur = 7
        context.shadowColor = 'rgba(0,229,255,.42)'
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.quadraticCurveTo(controlX, controlY, to.x, to.y)
        context.stroke()
        context.setLineDash([])
        context.shadowBlur = 0
      })

      GEO_CITIES.forEach(city => {
        const point = geoToPoint(city.lon, city.lat, rotation, cx, cy, radius)
        if (point.z <= 0.04) return
        const alpha = Math.min(point.z * 1.5, 1)
        const rgb = city.home ? '255,122,92' : '0,229,255'
        const color = city.home ? '#FF7A5C' : '#00E5FF'
        const pulse = (Math.sin(timestamp * 0.003 + city.lon) + 1) / 2
        const size = city.size * (radius / 210)
        context.fillStyle = `rgba(${rgb},${alpha * 0.16})`
        context.shadowBlur = 12
        context.shadowColor = color
        context.beginPath()
        context.arc(point.x, point.y, size + 4 + pulse * 3, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = `rgba(${rgb},${alpha})`
        context.beginPath()
        context.arc(point.x, point.y, size, 0, Math.PI * 2)
        context.fill()
        context.shadowBlur = 0
      })

      planes.forEach(plane => {
        const fromCity = cityByName(plane.route[0])
        const toCity = cityByName(plane.route[1])
        if (!fromCity || !toCity) return
        const from = geoToPoint(fromCity.lon, fromCity.lat, rotation, cx, cy, radius)
        const to = geoToPoint(toCity.lon, toCity.lat, rotation, cx, cy, radius)
        if (from.z < 0.05 && to.z < 0.05) return
        const t = plane.t
        const middleX = (from.x + to.x) / 2
        const middleY = (from.y + to.y) / 2
        const dx = to.x - from.x
        const dy = to.y - from.y
        const distance = Math.hypot(dx, dy)
        const controlX = middleX - dy * 0.24
        const controlY = middleY + dx * 0.24 - distance * 0.12
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * controlX + t * t * to.x
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y
        const nextT = Math.min(1, t + 0.015)
        const nextX = (1 - nextT) * (1 - nextT) * from.x + 2 * (1 - nextT) * nextT * controlX + nextT * nextT * to.x
        const nextY = (1 - nextT) * (1 - nextT) * from.y + 2 * (1 - nextT) * nextT * controlY + nextT * nextT * to.y
        const z = from.z * (1 - t) + to.z * t
        if (z <= 0.04) return
        drawPlane(x, y, Math.atan2(nextY - y, nextX - x), radius / 210, plane.color, Math.min(z * 1.5, 1))
      })

      context.restore()

      context.shadowBlur = 32
      context.shadowColor = 'rgba(0,229,255,.35)'
      context.strokeStyle = 'rgba(0,229,255,.52)'
      context.lineWidth = 1.5
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.stroke()
      context.shadowBlur = 70
      context.strokeStyle = 'rgba(0,180,255,.12)'
      context.lineWidth = 22
      context.stroke()
      context.shadowBlur = 0

      const specular = context.createRadialGradient(cx - radius * 0.34, cy - radius * 0.35, 0, cx - radius * 0.15, cy - radius * 0.18, radius * 0.72)
      specular.addColorStop(0, 'rgba(255,255,255,.08)')
      specular.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = specular
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.fill()
    }

    const loop = (timestamp: number) => {
      rotation += 0.055
      planes.forEach(plane => {
        plane.t += plane.speed
        if (plane.t > 1) plane.t = 0
      })
      draw(timestamp)
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameRef.current)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="hero-globe-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-globe-canvas" />
      <div className="hero-globe-overlay" />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroGlobeSvgFallback() {
  const routePaths = [
    { id: 'route-a', d: 'M360 405 C430 230 565 218 650 300 S785 430 860 270', opacity: 0.62, width: 2, duration: '9s', delay: '0s' },
    { id: 'route-b', d: 'M410 292 C520 178 695 210 815 375', opacity: 0.36, width: 1.4, duration: '11s', delay: '1.4s' },
    { id: 'route-c', d: 'M445 492 C560 590 770 505 850 325', opacity: 0.42, width: 1.5, duration: '10s', delay: '2.7s' },
    { id: 'route-d', d: 'M315 350 C462 480 610 210 740 275 S900 415 828 495', opacity: 0.32, width: 1.2, duration: '13s', delay: '3.2s' },
    { id: 'route-e', d: 'M505 210 C635 120 805 205 878 395', opacity: 0.26, width: 1.1, duration: '12s', delay: '4.5s' },
    { id: 'route-f', d: 'M382 455 C520 372 650 560 805 455', opacity: 0.34, width: 1.3, duration: '8.5s', delay: '5.1s' },
  ]
  const landMasses = [
    'M398 279 C413 250 451 238 487 247 C505 252 517 267 509 284 C497 309 519 321 532 340 C547 362 528 382 501 384 C477 386 462 371 447 356 C430 338 399 334 389 310 C384 297 389 286 398 279Z',
    'M440 360 C461 369 475 386 482 406 C490 429 511 444 508 472 C505 500 486 532 468 539 C451 546 445 515 448 489 C451 462 431 449 421 427 C411 405 417 375 440 360Z',
    'M532 254 C553 237 580 238 598 251 C611 261 608 278 591 286 C574 294 549 289 532 274 C526 268 526 260 532 254Z',
    'M576 288 C603 265 641 258 681 264 C718 270 741 290 773 300 C808 311 822 338 807 361 C790 387 747 378 711 383 C682 387 658 410 626 401 C597 393 600 356 579 337 C560 320 554 306 576 288Z',
    'M597 346 C622 342 653 358 670 385 C690 418 681 459 656 491 C635 518 607 493 599 457 C590 415 573 375 597 346Z',
    'M741 427 C769 415 811 426 829 457 C847 488 814 509 779 500 C744 491 716 439 741 427Z',
    'M395 507 C455 521 535 531 609 530 C692 529 775 513 823 524 C788 543 720 552 624 553 C529 554 443 545 395 527Z',
  ]
  const continentLights = [
    [407, 284], [421, 266], [445, 252], [472, 249], [493, 257], [507, 275], [496, 296], [512, 322], [527, 348], [511, 374], [485, 381], [461, 365], [438, 342], [406, 322],
    [444, 369], [462, 385], [477, 409], [493, 435], [504, 464], [497, 493], [478, 524], [459, 526], [449, 493], [454, 462], [432, 426],
    [536, 263], [556, 247], [580, 247], [596, 262], [586, 282], [560, 282],
    [579, 294], [604, 276], [638, 267], [674, 268], [709, 278], [738, 292], [774, 305], [803, 329], [809, 354], [785, 374], [747, 376], [711, 383], [674, 394], [637, 400], [603, 387], [599, 354],
    [602, 353], [626, 351], [650, 366], [668, 392], [678, 421], [669, 455], [651, 488], [628, 500], [610, 474], [603, 434], [588, 390],
    [746, 434], [772, 424], [801, 433], [823, 458], [822, 485], [794, 501], [760, 490],
    [415, 517], [472, 529], [540, 535], [611, 536], [682, 532], [752, 523], [811, 528],
  ]

  return (
    <div className="hero-globe-bg" aria-hidden="true">
      <svg className="hero-network-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="heroGlobeGlow" cx="50%" cy="45%" r="52%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#003E6C" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#04060E" stopOpacity="0" />
          </radialGradient>
          <filter id="heroRouteGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <symbol id="hero-airplane-shape" viewBox="-26 -14 52 28">
            <path d="M25 0 L-20 -13 L-11 -2 L-25 -1 L-25 1 L-11 2 L-20 13 Z" />
            <path d="M-7 -2 L-17 -9 L-13 -2 Z" opacity=".72" />
            <path d="M-7 2 L-17 9 L-13 2 Z" opacity=".72" />
          </symbol>
          <clipPath id="heroGlobeClip">
            <ellipse cx="600" cy="355" rx="225" ry="172" />
          </clipPath>
        </defs>
        <rect width="1200" height="800" fill="#04060E" />
        <circle cx="600" cy="355" r="330" fill="url(#heroGlobeGlow)" />
        <g className="hero-svg-world">
          <circle cx="600" cy="355" r="222" fill="none" stroke="rgba(0,229,255,.24)" strokeWidth="1.5" />
          <circle cx="600" cy="355" r="246" fill="none" stroke="rgba(146,217,255,.08)" strokeWidth="18" />
          <g clipPath="url(#heroGlobeClip)">
            <rect x="360" y="180" width="480" height="350" fill="rgba(0,229,255,.025)" />
            <g className="hero-globe-grid" fill="none">
              {[430, 500, 570, 640, 710, 780].map(x => (
                <path key={`lon-${x}`} d={`M${x} 183 C${x - 38} 250 ${x - 38} 460 ${x} 527`} />
              ))}
              {[235, 295, 355, 415, 475].map(y => (
                <path key={`lat-${y}`} d={`M372 ${y} C482 ${y + 24} 718 ${y + 24} 828 ${y}`} />
              ))}
            </g>
            <g className="hero-continents-roll">
              {[0, 480].map(offset => (
                <g key={offset} transform={`translate(${offset} 0)`}>
                  <g className="hero-continent-fill">
                    {landMasses.map(path => <path key={`${offset}-${path}`} d={path} />)}
                  </g>
                  <g className="hero-continent-lights">
                    {continentLights.map(([cx, cy], index) => (
                      <circle key={`${offset}-${cx}-${cy}`} cx={cx} cy={cy} r={index % 6 === 0 ? 2.15 : 1.45} style={{ animationDelay: `${(index % 9) * 0.18}s` }} />
                    ))}
                  </g>
                </g>
              ))}
            </g>
          </g>
          <g fill="none" stroke="#00E5FF" strokeLinecap="round" filter="url(#heroRouteGlow)">
            {routePaths.map(route => (
              <path
                key={route.id}
                id={route.id}
                className="hero-random-route"
                d={route.d}
                strokeOpacity={route.opacity}
                strokeWidth={route.width}
              />
            ))}
          </g>
          {routePaths.slice(0, 4).map((route, index) => (
            <g key={`plane-${route.id}`} className="hero-plane">
              <animateMotion dur={route.duration} begin={route.delay} repeatCount="indefinite" rotate="auto">
                <mpath href={`#${route.id}`} />
              </animateMotion>
              <use href="#hero-airplane-shape" x="-17" y="-9" width="34" height="18" fill={index % 2 === 0 ? '#FFFFFF' : '#A8E063'} />
            </g>
          ))}
        </g>
      </svg>
      <div className="hero-globe-overlay" />
    </div>
  )
}

function tripToDestination(trip: Trip, index: number): DestinationData {
  const destination = trip.destination
  const ratings = trip.reviews?.filter(review => review.isPublished).map(review => review.rating) ?? []
  const rating = ratings.length > 0
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 4.8

  return {
    title: trip.title,
    location: [destination?.city || destination?.name, destination?.country].filter(Boolean).join(', '),
    days: trip.durationDays,
    price: formatCurrency(trip.price),
    rating: Number(rating.toFixed(1)),
    tag: trip.highlights?.[0] || destination?.name || 'Destino destacado',
    accent: ACCENTS[index % ACCENTS.length],
    bg: trip.coverImage || destination?.coverImage || FALLBACK_DESTINATIONS[index % FALLBACK_DESTINATIONS.length].bg,
    slug: trip.slug,
  }
}

const COMPANY_INFO = [
  {
    num: '01',
    color: '#00E5FF',
    title: 'Nuestra mision',
    text: 'Conectar a los viajeros con destinos memorables mediante planes seguros, claros y acompanados de principio a fin.',
  },
  {
    num: '02',
    color: '#FF7A5C',
    title: 'Nuestra vision',
    text: 'Ser una agencia referente en Colombia por su servicio cercano, experiencias bien disenadas y confianza en cada reserva.',
  },
  {
    num: '03',
    color: '#A8E063',
    title: 'Como somos',
    text: 'Somos una agencia de viajes humana, organizada y transparente: escuchamos tu idea, cuidamos los detalles y te acompanamos durante el proceso.',
  },
]

const FOOTER_LINKS = [
  { label: 'Términos',    href: '/legal?seccion=terminos' },
  { label: 'Privacidad',  href: '/legal?seccion=privacidad' },
  { label: 'Reembolsos',  href: '/legal?seccion=reembolsos' },
  { label: 'Contacto',    href: '/legal?seccion=contacto' },
]

/* ─── HOOKS ──────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, active = false): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let t0: number | null = null
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return count
}

/* ─── STAT CARD ──────────────────────────────────────────────────────── */
type StatCardProps = StatItem & { accent?: string; animate: boolean }

function StatCard({ value, suffix, label, accent = '#00E5FF', animate }: StatCardProps) {
  const count = useCountUp(value, 1600, animate)
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent, fontFamily: 'Georgia,serif', lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

/* ─── DESTINATION CARD ───────────────────────────────────────────────── */
function DestinationCard({ card, elevated = false }: { card: DestinationData; elevated?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [liked,   setLiked]   = useState(false)
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 28, overflow: 'hidden',
        height: elevated ? 520 : 440,
        transform: hovered ? 'translateY(-10px) scale(1.015)' : elevated ? 'translateY(-24px)' : 'translateY(0)',
        transition: 'transform 0.45s cubic-bezier(.175,.885,.32,1.275), box-shadow 0.45s ease',
        boxShadow: hovered ? `0 48px 96px rgba(0,0,0,0.6),0 0 60px ${card.accent}25` : '0 24px 60px rgba(0,0,0,0.4)',
      }}
    >
      <Image src={card.bg} alt={card.title} fill sizes="(min-width: 1024px) 33vw, 100vw" style={{ objectFit: 'cover', transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.7s ease' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(4,6,14,0.97) 0%,rgba(4,6,14,0.4) 55%,transparent 100%)' }} />

      {/* Top row */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ background: `${card.accent}22`, border: `1px solid ${card.accent}55`, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: card.accent, backdropFilter: 'blur(8px)' }}>
          {card.tag}
        </span>
        <button
          type="button"
          onClick={() => setLiked(v => !v)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', color: liked ? '#FF7A5C' : 'white', transition: 'all 0.2s' }}
        >
          <Heart size={15} fill={liked ? '#FF7A5C' : 'none'} />
        </button>
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'white', fontFamily: 'Georgia,serif' }}>{card.rating}</span>
          <Star size={15} fill={card.accent} color={card.accent} style={{ marginBottom: 2 }} />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 10px', lineHeight: 1.15, fontFamily: 'Georgia,serif' }}>{card.title}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {[`📍 ${card.location}`, `🕐 ${card.days} días`].map(t => (
            <span key={t} style={{ fontSize: 11, background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '4px 12px', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>desde</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: card.accent }}>{card.price}</div>
          </div>
          {/* ✅ Link funcional hacia el detalle del viaje */}
          <Link
            href={`/viajes/${card.slug}`}
            style={{ background: 'white', border: 'none', borderRadius: 100, padding: '11px 22px', fontSize: 13, fontWeight: 800, color: '#04060E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', boxShadow: `0 4px 20px ${card.accent}44` }}
          >
            Reservar <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {elevated && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: i===1 ? 20 : 6, height: 6, borderRadius: 100, background: i===1 ? '#00E5FF' : 'rgba(255,255,255,0.3)' }} />)}
        </div>
      )}
    </article>
  )
}

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.cv{--cv-bg:#050711;--cv-bg-2:#07101D;--cv-surface:#0A1322;--cv-surface-2:#0F1D30;--cv-cyan:#00E5FF;--cv-blue:#008CFF;--cv-coral:#FF7A5C;--cv-lime:#A8E063;--cv-cream:#F5F1E8;--cv-muted:rgba(245,241,232,.58);font-family:'DM Sans',system-ui,sans-serif;background:radial-gradient(circle at 50% 0%,rgba(0,229,255,.1) 0%,transparent 34%),radial-gradient(circle at 12% 35%,rgba(255,122,92,.055) 0%,transparent 32%),linear-gradient(180deg,var(--cv-bg) 0%,var(--cv-bg-2) 44%,var(--cv-bg) 100%);color:var(--cv-cream);min-height:100vh;overflow-x:hidden;scroll-behavior:smooth}
.cv-d{font-family:'Cormorant Garamond',Georgia,serif}
@keyframes fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeDown{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
@keyframes softScaleIn{from{opacity:0;transform:translateY(28px) scale(.96);filter:blur(8px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
@keyframes lineSweep{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
@keyframes softGlow{0%,100%{box-shadow:0 0 24px rgba(0,229,255,.18)}50%{box-shadow:0 0 42px rgba(0,229,255,.34)}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes orb{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.08);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes spin{to{transform:rotate(360deg)}}
.a1{animation:fadeUp .8s ease both .05s}
.a2{animation:fadeUp .8s ease both .25s}
.a3{animation:fadeUp .8s ease both .45s}
.a4{animation:fadeUp .8s ease both .65s}
.a5{animation:fadeUp .8s ease both .80s}
.cv>nav{animation:fadeDown .7s cubic-bezier(.22,1,.36,1) both}
.cv section{position:relative}
.cv section>div,.cv footer>div{will-change:opacity,transform}
.hero-stats-grid>div{animation:softScaleIn .72s cubic-bezier(.22,1,.36,1) both}
.hero-stats-grid>div:nth-child(1){animation-delay:.88s}
.hero-stats-grid>div:nth-child(2){animation-delay:.98s}
.hero-stats-grid>div:nth-child(3){animation-delay:1.08s}
.hero-stats-grid>div:nth-child(4){animation-delay:1.18s}
.tick span{animation:fadeUp .65s ease both}
.tick span:nth-child(2n){animation-delay:.06s}
.tick span:nth-child(3n){animation-delay:.12s}
.site-footer{border-top:1px solid rgba(189,244,255,0.1);background:linear-gradient(180deg,#050711 0%,#03050C 100%);padding:42px 48px 34px;position:relative;z-index:2}
.site-footer::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.38),rgba(255,122,92,.22),transparent)}
.site-footer-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.25fr auto 1fr;gap:32px;align-items:center}
.site-footer-brand{display:flex;align-items:center;gap:10px;text-decoration:none;width:max-content}
.site-footer-logo{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#00E5FF,#008CFF);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 22px rgba(0,229,255,.22)}
.site-footer-links{display:flex;gap:22px;flex-wrap:wrap;justify-content:center}
.site-footer-link{font-size:13px;color:rgba(255,255,255,0.46);text-decoration:none;transition:color .2s,transform .2s}
.site-footer-link:hover{color:#00E5FF;transform:translateY(-1px)}
.site-footer-meta{text-align:right;font-size:12px;color:rgba(255,255,255,0.26);line-height:1.8}
.site-footer-meta strong{display:block;color:rgba(255,255,255,.62);font-size:13px;font-weight:700}
.cv a,.cv button{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease,color .22s ease,filter .22s ease}
.cv a:hover,.cv button:hover{transform:translateY(-2px)}
.cv a:active,.cv button:active{transform:translateY(0) scale(.98)}
.hero-stats-grid>div:hover{transform:translateY(-5px) scale(1.02);border-color:rgba(0,229,255,.24)!important;background:rgba(0,229,255,.055)!important}
.desktop-nav-actions .btn-p{animation:softGlow 3.8s ease-in-out infinite}
.reveal{opacity:1;transform:translateY(0);filter:blur(0);transition:opacity .82s cubic-bezier(.22,1,.36,1),transform .82s cubic-bezier(.22,1,.36,1),filter .82s cubic-bezier(.22,1,.36,1);transition-delay:var(--reveal-delay,0ms);will-change:opacity,transform,filter}
.motion-ready .reveal{opacity:0;transform:translateY(42px);filter:blur(10px)}
.motion-ready .reveal.in-view{opacity:1;transform:translateY(0);filter:blur(0)}
.reveal-pop{opacity:1;transform:translateY(0) scale(1);filter:blur(0);transition:opacity .78s cubic-bezier(.22,1,.36,1),transform .78s cubic-bezier(.22,1,.36,1),filter .78s cubic-bezier(.22,1,.36,1);transition-delay:var(--reveal-delay,0ms);will-change:opacity,transform,filter}
.motion-ready .reveal-pop{opacity:0;transform:translateY(36px) scale(.94);filter:blur(10px)}
.motion-ready .reveal-pop.in-view{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
.section-kicker{position:relative;display:inline-block}
.section-kicker::after{content:'';position:absolute;left:0;bottom:-9px;width:52px;height:2px;border-radius:999px;background:linear-gradient(90deg,var(--cv-cyan),var(--cv-coral));transform:scaleX(0);transform-origin:left;opacity:0}
.motion-ready .reveal.in-view .section-kicker::after,.motion-ready .section-kicker.in-view::after{animation:lineSweep .7s cubic-bezier(.22,1,.36,1) both .18s}
.tick{display:flex;width:max-content;animation:ticker 24s linear infinite}
.grid-bg{background-image:radial-gradient(rgba(189,244,255,0.035) 1px,transparent 1px);background-size:44px 44px}
.nav-a{font-size:14px;font-weight:600;color:rgba(255,255,255,0.55);cursor:pointer;transition:color .2s;text-decoration:none;padding:4px 0}
.nav-a:hover{color:var(--cv-cyan)}
.btn-p{background:linear-gradient(135deg,var(--cv-cyan) 0%,var(--cv-blue) 100%);border:none;border-radius:100px;padding:14px 36px;font-family:inherit;font-size:15px;font-weight:800;color:#03111A;cursor:pointer;display:inline-flex;align-items:center;gap:8px;text-decoration:none;box-shadow:0 0 34px rgba(0,229,255,.28);transition:transform .2s,box-shadow .2s,filter .2s}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(0,229,255,.42);filter:saturate(1.08)}
.btn-o{background:rgba(255,255,255,.025);border:1.5px solid rgba(189,244,255,0.16);border-radius:100px;padding:14px 36px;font-family:inherit;font-size:15px;font-weight:700;color:white;cursor:pointer;display:inline-flex;align-items:center;gap:8px;text-decoration:none;transition:border-color .2s,background .2s,transform .2s}
.btn-o:hover{border-color:rgba(0,229,255,.45);background:rgba(0,229,255,.07);transform:translateY(-2px)}
.feat{background:linear-gradient(135deg,rgba(255,255,255,0.065),rgba(255,255,255,0.022));border:1px solid rgba(189,244,255,0.11);border-radius:24px;padding:40px 32px;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.18);transition:border-color .3s,background .3s,transform .3s}
.feat:hover{border-color:rgba(0,229,255,0.28);background:linear-gradient(135deg,rgba(0,229,255,0.08),rgba(255,255,255,0.035));transform:translateY(-4px)}
.cv ::-webkit-scrollbar{width:6px}
.cv ::-webkit-scrollbar-track{background:#050711}
.cv ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
.hero-globe-bg{position:absolute;inset:0;overflow:hidden;background:#050711}
.hero-earth-bg{position:absolute;inset:0;overflow:hidden;background:#050711}
.hero-earth-bg canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block}
.hero-earth-bg::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at center,rgba(5,7,17,.08) 0%,rgba(5,7,17,.34) 42%,rgba(5,7,17,.9) 100%),linear-gradient(to bottom,rgba(5,7,17,.05) 0%,rgba(5,7,17,.22) 56%,#050711 100%)}
.hero-earth-bg--failed{background:radial-gradient(circle at 50% 42%,rgba(0,229,255,.16),rgba(5,7,17,.92) 68%)}
.hero-globe-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hero-network-svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.geo-map-motion,.geo-map-loop{animation:geoWorldSlide 34s linear infinite}
.geo-grid path{stroke:rgba(189,244,255,.11);stroke-width:.75}
.geo-land-a{fill:rgba(0,194,255,.105);stroke:rgba(189,244,255,.44);stroke-width:1.15;filter:drop-shadow(0 0 8px rgba(0,229,255,.14))}
.geo-land-b{fill:rgba(45,212,191,.085);stroke:rgba(189,244,255,.38);stroke-width:1.1;filter:drop-shadow(0 0 7px rgba(168,224,99,.1))}
.geo-lights circle{fill:#BDF4FF;opacity:.5;filter:drop-shadow(0 0 5px rgba(0,229,255,.64));animation:continentPulse 2.8s ease-in-out infinite}
.geo-lights .geo-home-city{fill:#FF7A5C;opacity:1;filter:drop-shadow(0 0 10px rgba(255,122,92,.9))}
.geo-lights .geo-city{fill:#00E5FF;opacity:.95;filter:drop-shadow(0 0 10px rgba(0,229,255,.85))}
.geo-routes path{stroke:#00E5FF;stroke-width:.72;stroke-dasharray:6 11;stroke-opacity:.16;animation:routeFlow 5.5s linear infinite}
.geo-planes use{filter:drop-shadow(0 0 9px rgba(0,229,255,.7))}
.hero-svg-world{transform-origin:600px 355px}
.hero-continents-roll{animation:worldMapRoll 28s linear infinite}
.hero-continent-fill{fill:rgba(0,194,255,.22);stroke:rgba(189,244,255,.42);stroke-width:1.15;stroke-linejoin:round;filter:drop-shadow(0 0 9px rgba(0,229,255,.16))}
.hero-continent-lights circle{fill:#BDF4FF;opacity:.72;filter:drop-shadow(0 0 5px rgba(0,229,255,.85));animation:continentPulse 2.8s ease-in-out infinite}
.hero-globe-grid path{stroke:rgba(189,244,255,.16);stroke-width:1}
.hero-random-route{stroke-dasharray:10 16;animation:routeFlow 5.5s linear infinite}
.hero-plane{transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 12px rgba(0,229,255,.85)) drop-shadow(0 0 22px rgba(0,229,255,.28))}
.hero-globe-overlay{position:absolute;inset:0;background:radial-gradient(circle at 50% 39%,rgba(5,7,17,.62) 0%,rgba(5,7,17,.43) 34%,rgba(5,7,17,.68) 64%,rgba(5,7,17,.92) 100%),linear-gradient(to bottom,rgba(5,7,17,.08) 0%,rgba(5,7,17,.18) 48%,#050711 100%);pointer-events:none}
@keyframes worldMapRoll{from{transform:translateX(0)}to{transform:translateX(-480px)}}
@keyframes routeFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-52}}
@keyframes geoWorldSlide{from{transform:translateX(0)}to{transform:translateX(-590px)}}
@keyframes continentPulse{0%,100%{opacity:.48}50%{opacity:.95}}
@media (prefers-reduced-motion:reduce){
  .reveal,.reveal-pop,.cv>nav,.hero-stats-grid>div,.tick span,.cv footer{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
  .geo-map-motion,.geo-map-loop,.tick,.hero-continents-roll,.geo-routes path,.hero-random-route,.desktop-nav-actions .btn-p{animation:none!important}
}
@media (max-width:920px){
  .desktop-nav-links{display:none!important}
  .desktop-nav-actions{display:none!important}
  .hero-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-width:420px!important;margin-top:58px!important}
  .destinations-grid,.features-grid{grid-template-columns:1fr!important}
  .about-grid{grid-template-columns:1fr!important;gap:52px!important}
  .site-footer-inner{grid-template-columns:1fr!important;text-align:center!important;justify-items:center!important}
  .site-footer-meta{text-align:center!important}
}
@media (max-width:560px){
  .cv .btn-p,.cv .btn-o{width:100%;justify-content:center}
  .hero-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
}
`

/* ─── PAGE ───────────────────────────────────────────────────────────── */
export default function CieloViajesHome({ featuredTrips }: { featuredTrips: Trip[] }) {
  const [statsOn,  setStatsOn]  = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const statsRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const destinations = featuredTrips.length > 0
    ? featuredTrips.slice(0, 4).map(tripToDestination)
    : FALLBACK_DESTINATIONS

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsOn(true) },
      { threshold: 0.25 }
    )
    if (statsRef.current) io.observe(statsRef.current)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    let cleanup = () => {}

    function setupGsap() {
      const root = pageRef.current
      if (!root) return

      gsap.registerPlugin(ScrollTrigger)

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) {
        root.querySelectorAll('.reveal,.reveal-pop').forEach(element => element.classList.add('in-view'))
        return
      }

      const context = gsap.context(() => {
        gsap.set('.reveal', { autoAlpha: 0, y: 46, filter: 'blur(10px)' })
        gsap.set('.reveal-pop', { autoAlpha: 0, y: 34, scale: 0.94, filter: 'blur(10px)' })

        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo('.gsap-hero',
            { autoAlpha: 0, y: 34, filter: 'blur(8px)' },
            {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.95,
            stagger: 0.12,
            clearProps: 'opacity,visibility,transform,filter',
          })
          .fromTo('.hero-stats-grid > div',
            { autoAlpha: 0, y: 28, scale: 0.94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.08, ease: 'back.out(1.5)' },
            '-=0.35'
          )

        gsap.utils.toArray<HTMLElement>('.reveal,.reveal-pop').forEach((element) => {
          const isPop = element.classList.contains('reveal-pop')
          gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: isPop ? 0.85 : 0.95,
            ease: isPop ? 'back.out(1.35)' : 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 86%',
              once: true,
              onEnter: () => element.classList.add('in-view'),
            },
          })
        })

        gsap.utils.toArray<HTMLElement>('.destinations-grid > *, .features-grid > *').forEach((element, index) => {
          gsap.fromTo(element,
            { autoAlpha: 0, y: 42, scale: 0.94, filter: 'blur(8px)' },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.8,
              delay: (index % 3) * 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 88%', once: true },
            }
          )
        })
      }, root)

      cleanup = () => {
        context.revert()
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }

    setupGsap()
    return () => cleanup()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={pageRef} className="cv">

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
          padding: '0 48px', height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(5,7,17,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(189,244,255,0.08)' : 'none',
          transition: 'background .4s, border .4s',
        }}>
          {/* Logo — offset para no chocar con el botón hamburguesa (zIndex 99999) */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginLeft: 48 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#00E5FF,#008CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 24px rgba(0,229,255,.24)' }}>✈️</div>
            <span className="cv-d" style={{ fontWeight: 900, fontSize: 20, color: 'white' }}>Cielo</span>
            <span style={{ fontWeight: 300, fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>Viajes</span>
          </Link>

          <div className="desktop-nav-links" style={{ display: 'flex', gap: 36 }}>
            <Link href="/"          className="nav-a">Inicio</Link>
            <Link href="/viajes"    className="nav-a">Viajes</Link>
            <Link href="/destinos"  className="nav-a">Destinos</Link>
            <Link href="/#nosotros" className="nav-a">Nosotros</Link>
          </div>

          <div className="desktop-nav-actions flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="nav-a" style={{ fontSize: 14, fontWeight: 700 }}>
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="btn-p" style={{ padding: '10px 24px', fontSize: 13 }}>
                  Registrarse
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold font-body transition-all text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-slate-900 text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span>{user?.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-950 border border-slate-800 rounded-2xl py-2 shadow-2xl z-50">
                    <Link
                      href="/mi-cuenta"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-sky-400 hover:bg-white/5 font-body transition-colors"
                    >
                      <User size={15} /> Mi perfil
                    </Link>
                    <Link
                      href="/mi-cuenta/reservas"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-sky-400 hover:bg-white/5 font-body transition-colors"
                    >
                      <LayoutDashboard size={15} /> Mis reservas
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-sky-400 hover:bg-white/5 font-body transition-colors"
                      >
                        <LayoutDashboard size={15} /> Panel admin
                      </Link>
                    )}
                    {user?.role === 'AGENT' && (
                      <Link
                        href="/agente"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-sky-400 hover:bg-white/5 font-body transition-colors"
                      >
                        <LayoutDashboard size={15} /> Panel agente
                      </Link>
                    )}
                    <hr className="my-1.5 border-slate-800" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 font-body transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', overflow: 'hidden' }}>
          <HeroEarthBackground />
          <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,255,0.09) 0%,transparent 66%)', top: -170, right: -170, animation: 'orb 8s ease infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,122,92,0.065) 0%,transparent 66%)', bottom: 0, left: -120, animation: 'orb 10s ease infinite 3s', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 880 }}>
            <div className="a1 gsap-hero" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 100, padding: '8px 22px', fontSize: 11, fontWeight: 800, color: '#00E5FF', marginBottom: 32, letterSpacing: '0.15em' }}>
              <Sparkles size={12} style={{ animation: 'spin 3s linear infinite' }} />
              AGENCIA DE VIAJES N°1 EN COLOMBIA
            </div>

            <h1 className="a2 gsap-hero cv-d" style={{ fontSize: 'clamp(54px,7.5vw,100px)', fontWeight: 900, lineHeight: 1, margin: '0 0 24px', color: 'white' }}>
              Vuela hacia<br />
              <span style={{ background: 'linear-gradient(100deg,#00E5FF 0%,#0099FF 40%,#FF7A5C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                tu próxima
              </span><br />
              <em style={{ fontStyle: 'italic', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>aventura</em>
            </h1>

            <p className="a3 gsap-hero" style={{ fontSize: 18, color: 'rgba(255,255,255,0.48)', fontWeight: 300, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.8 }}>
              Paquetes todo incluido a los destinos más increíbles. Sin complicaciones, con la mejor experiencia.
            </p>

            <div className="a4 gsap-hero" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/viajes"   className="btn-p" style={{ fontSize: 15, padding: '15px 40px' }}>Explorar viajes <ArrowRight size={16} /></Link>
              <Link href="/destinos" className="btn-o" style={{ fontSize: 15, padding: '15px 40px' }}>Ver destinos <ChevronRight size={16} /></Link>
            </div>
          </div>

          <div ref={statsRef} className="a5 hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 600, width: '100%', marginTop: 80, position: 'relative', zIndex: 1 }}>
            {STATS.map((s, i) => <StatCard key={s.label} {...s} accent={ACCENTS[i]} animate={statsOn} />)}
          </div>

          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.18)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', animation: 'float 2.5s ease infinite', pointerEvents: 'none' }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom,transparent,rgba(255,255,255,0.25))' }} />
            SCROLL
          </div>
        </section>

        {/* ── TICKER ──────────────────────────────────────── */}
        <div className="reveal" style={{ background: 'linear-gradient(90deg,#00E5FF 0%,#A8E063 48%,#FFD47E 100%)', padding: '13px 0', overflow: 'hidden', boxShadow: '0 18px 60px rgba(0,0,0,.22)' }}>
          <div className="tick">
            {[...TICKER, ...TICKER].map((d, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 900, color: '#04060E', letterSpacing: '0.12em', padding: '0 32px', whiteSpace: 'nowrap' }}>✦ {d.toUpperCase()}</span>
            ))}
          </div>
        </div>

        {/* ── DESTINATIONS ────────────────────────────────── */}
        <section id="destinos" style={{ padding: '100px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p className="section-kicker" style={{ fontSize: 11, fontWeight: 800, color: '#00E5FF', letterSpacing: '0.25em', marginBottom: 14 }}>DESTINOS DESTACADOS</p>
              <h2 className="cv-d" style={{ fontSize: 'clamp(34px,4.5vw,58px)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
                Experiencias que<br />se sienten inolvidables
              </h2>
            </div>
            <Link href="/viajes" className="btn-o" style={{ fontSize: 14, padding: '12px 28px', whiteSpace: 'nowrap' }}>
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          <div className="destinations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, paddingTop: 40, paddingBottom: 8 }}>
            {destinations.slice(0,3).map((card, i) => (
              <div key={card.title} className="reveal-pop" style={{ '--reveal-delay': `${i * 120}ms` } as React.CSSProperties}>
                <DestinationCard card={card} elevated={i === 1} />
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <section id="nosotros" style={{ padding: '88px 48px', background: 'linear-gradient(135deg,rgba(0,229,255,0.045),rgba(255,122,92,0.025) 48%,rgba(168,224,99,0.025))', borderTop: '1px solid rgba(189,244,255,0.08)', borderBottom: '1px solid rgba(189,244,255,0.08)' }}>
          <div className="about-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div className="reveal">
              <p className="section-kicker" style={{ fontSize: 11, fontWeight: 800, color: '#FF7A5C', letterSpacing: '0.25em', marginBottom: 16 }}>SOBRE CIELO VIAJES</p>
              <h2 className="cv-d" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 40 }}>
                Una agencia creada<br />para viajar con confianza
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.85, marginTop: -24, marginBottom: 36, maxWidth: 560 }}>
                En Cielo Viajes disenamos experiencias para personas que quieren viajar sin perder tiempo en dudas, letra pequena o procesos confusos. Organizamos cada detalle con atencion cercana, precios claros y acompanamiento real.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {COMPANY_INFO.map(s => (
                  <div key={s.num} className="reveal" style={{ '--reveal-delay': `${Number(s.num) * 90}ms`, display: 'flex', gap: 20, alignItems: 'flex-start' } as React.CSSProperties}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${s.color}18`, border: `1px solid ${s.color}44`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{s.num}</div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>{s.title}</h3>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal-pop" style={{ position: 'relative', height: 420, '--reveal-delay': '160ms' } as React.CSSProperties}>
              {[
                { left: '5%',  top: 40,         w: 190, h: 270, src: 'photo-1436491865332-7a61a109cc05' },
                { left: '38%', top: 0,           w: 210, h: 220, src: 'photo-1500530855697-b586d89ba3ee' },
                { right: '5%', bottom: 0,        w: 190, h: 220, src: 'photo-1500534314209-a25ddb2bd429' },
              ].map((img, i) => (
                <div key={i} style={{ position: 'absolute', ...img, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', width: img.w, height: img.h }}>
                  <Image src={`https://images.unsplash.com/${img.src}?w=400&q=80`} alt="" fill sizes="220px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
              <div style={{ position: 'absolute', right: '28%', top: 20, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00E5FF,#008CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,229,255,0.34)', animation: 'float 3s ease infinite' }}>
                <Plane size={26} color="white" />
              </div>
              <div style={{ position: 'absolute', left: '14%', bottom: 18, maxWidth: 260, borderRadius: 22, border: '1px solid rgba(189,244,255,.12)', background: 'linear-gradient(135deg,rgba(10,19,34,.82),rgba(15,29,48,.58))', padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 24px 70px rgba(0,0,0,.28)' }}>
                <p style={{ color: '#00E5FF', fontSize: 11, fontWeight: 900, letterSpacing: '.16em', marginBottom: 8 }}>NUESTRO COMPROMISO</p>
                <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13, lineHeight: 1.7 }}>
                  Viajes bien planeados, asesoria honesta y soporte antes, durante y despues de tu aventura.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────── */}
        <section style={{ padding: '100px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#A8E063', letterSpacing: '0.25em', marginBottom: 14 }}>POR QUÉ ELEGIRNOS</p>
            <h2 className="cv-d" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
              Viajamos contigo,<br />no solo te vendemos un pasaje
            </h2>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {FEATURES.map(({ Icon, title, text, accent }, i) => (
              <div key={title} className="feat reveal-pop" style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${accent}15`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Icon size={26} color={accent} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: 'white', marginBottom: 12, fontFamily: 'Georgia,serif' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ── CTA BAND ────────────────────────────────────── */}
        <section style={{ position: 'relative', padding: '108px 48px', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(180deg,rgba(5,7,17,0),rgba(10,19,34,.72),rgba(5,7,17,0))' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 58% at 50% 48%,rgba(0,229,255,0.085) 0%,transparent 70%),radial-gradient(circle at 65% 35%,rgba(255,122,92,0.07) 0%,transparent 36%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, borderTop: '1px solid rgba(189,244,255,0.08)', borderBottom: '1px solid rgba(189,244,255,0.08)', pointerEvents: 'none' }} />
          <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="cv-d" style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 24 }}>
              ¿Listo para tu<br />
              <span style={{ background: 'linear-gradient(100deg,#00E5FF 0%,#008CFF 52%,#FF7A5C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                próxima aventura?
              </span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.8, fontWeight: 300 }}>
              Habla con un asesor y diseña el viaje de tus sueños en menos de 24 horas.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/viajes"   className="btn-p" style={{ fontSize: 16, padding: '16px 44px' }}>Explorar viajes <ArrowRight size={17} /></Link>
              {/* WhatsApp — abre chat directo */}
              <a
                href="https://wa.me/573001234567?text=Hola%2C%20quiero%20información%20sobre%20un%20viaje"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#25D366', border: 'none', borderRadius: 100, padding: '16px 44px', fontSize: 16, fontWeight: 800, color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer className="site-footer" style={{ borderTop: '1px solid rgba(189,244,255,0.08)', background: 'linear-gradient(180deg,#050711 0%,#03050C 100%)', padding: '40px 48px' }}>
          <div className="site-footer-inner" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.25fr auto 1fr', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#00E5FF,#008CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 0 22px rgba(0,229,255,.22)' }}>✈️</div>
              <span className="cv-d" style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>Cielo Viajes</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>· Agencia #1 en Colombia</span>
            </Link>

            {/* Links legales */}
            <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {FOOTER_LINKS.map(({ label, href }) => (
                <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Copyright */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>© 2025 Cielo Viajes ✦ Bogotá, Colombia</p>
          </div>
        </footer>

      </div>

      {/* ── Flotantes — fuera del div principal para no competir con z-index ── */}
      <SidebarNav />   {/* ← botón hamburguesa y panel lateral restaurados */}
      <ChatBot />
      <WhatsAppButton />
    </>
  )
}
