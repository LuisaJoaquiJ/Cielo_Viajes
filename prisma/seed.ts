import 'dotenv/config';
import { PrismaClient, Role, TripStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log('Iniciando seed...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@travelagency.com' },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: 'admin@travelagency.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const destinations = [
    {
      name: 'Cartagena de Indias',
      slug: 'cartagena-de-indias',
      country: 'Colombia',
      city: 'Cartagena',
      description:
        'Murallas coloniales, playas del Caribe y una vida cultural vibrante para una escapada inolvidable.',
      coverImage:
        'https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80',
        'https://images.unsplash.com/photo-1605217613423-0a61bdffbd1a?w=1200&q=80',
      ],
      latitude: 10.391,
      longitude: -75.4794,
    },
    {
      name: 'San Andres Isla',
      slug: 'san-andres-isla',
      country: 'Colombia',
      city: 'San Andres',
      description:
        'El mar de siete colores, playas claras y planes de descanso para viajar en pareja, familia o amigos.',
      coverImage:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80',
      ],
      latitude: 12.5847,
      longitude: -81.7006,
    },
    {
      name: 'Medellin',
      slug: 'medellin',
      country: 'Colombia',
      city: 'Medellin',
      description:
        'Naturaleza, gastronomia, cultura urbana y pueblos cercanos en la ciudad de la eterna primavera.',
      coverImage:
        'https://images.unsplash.com/photo-1599423300746-b62533397364?w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80',
        'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1200&q=80',
      ],
      latitude: 6.2442,
      longitude: -75.5812,
    },
  ];

  const savedDestinations = new Map<string, string>();

  for (const destination of destinations) {
    const saved = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: { ...destination, isActive: true },
      create: destination,
    });
    savedDestinations.set(destination.slug, saved.id);
  }

  const trips = [
    {
      title: 'Cartagena Magica - 5 dias todo incluido',
      slug: 'cartagena-magica-5-dias',
      destinationSlug: 'cartagena-de-indias',
      description:
        'Disfruta Cartagena con hotel, recorridos historicos, playa, traslados y asistencia durante todo el viaje.',
      highlights: ['Ciudad amurallada', 'Islas del Rosario', 'Cena caribena', 'Tour historico'],
      includes: ['Hotel 4 noches', 'Desayunos', 'Traslados', 'Tour por la ciudad'],
      excludes: ['Tiquetes aereos', 'Gastos no especificados'],
      coverImage:
        'https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=1200&q=80',
      images: ['https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80'],
      departureDate: new Date('2026-07-12T09:00:00.000Z'),
      returnDate: new Date('2026-07-17T18:00:00.000Z'),
      durationDays: 5,
      price: '1850000',
      priceChild: '1350000',
      capacity: 24,
      bookedSeats: 6,
      status: TripStatus.PUBLISHED,
      departureCity: 'Bogota',
      isFeatured: true,
    },
    {
      title: 'San Andres Paraiso - 7 dias',
      slug: 'san-andres-paraiso-7-dias',
      destinationSlug: 'san-andres-isla',
      description:
        'Una semana para descansar frente al mar, visitar Johnny Cay y disfrutar planes nauticos con acompanamiento local.',
      highlights: ['Mar de siete colores', 'Johnny Cay', 'Acuario natural', 'Tarde libre de playa'],
      includes: ['Hotel 6 noches', 'Desayunos y cenas', 'Excursion a Johnny Cay', 'Asistencia'],
      excludes: ['Tarjeta de turismo', 'Almuerzos no indicados'],
      coverImage:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      images: ['https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80'],
      departureDate: new Date('2026-08-03T10:00:00.000Z'),
      returnDate: new Date('2026-08-10T18:00:00.000Z'),
      durationDays: 7,
      price: '2450000',
      priceChild: '1800000',
      capacity: 18,
      bookedSeats: 4,
      status: TripStatus.PUBLISHED,
      departureCity: 'Medellin',
      isFeatured: true,
    },
    {
      title: 'Medellin Cultural y Guatape - 4 dias',
      slug: 'medellin-cultural-guatape-4-dias',
      destinationSlug: 'medellin',
      description:
        'Conoce Medellin, sus barrios transformados, su gastronomia y una salida completa al Penol y Guatape.',
      highlights: ['Comuna 13', 'Guatape', 'Piedra del Penol', 'Tour gastronomico'],
      includes: ['Hotel 3 noches', 'Desayunos', 'City tour', 'Excursion a Guatape'],
      excludes: ['Vuelos', 'Alimentacion no descrita'],
      coverImage:
        'https://images.unsplash.com/photo-1599423300746-b62533397364?w=1200&q=80',
      images: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80'],
      departureDate: new Date('2026-09-18T09:00:00.000Z'),
      returnDate: new Date('2026-09-22T18:00:00.000Z'),
      durationDays: 4,
      price: '980000',
      priceChild: '760000',
      capacity: 20,
      bookedSeats: 2,
      status: TripStatus.PUBLISHED,
      departureCity: 'Cali',
      isFeatured: true,
    },
  ];

  for (const trip of trips) {
    const { destinationSlug, ...tripData } = trip;
    const destinationId = savedDestinations.get(destinationSlug);

    if (!destinationId) {
      throw new Error(`Destino no encontrado para ${trip.title}`);
    }

    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: { ...tripData, destinationId, deletedAt: null },
      create: { ...tripData, destinationId },
    });
  }

  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
