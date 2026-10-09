import PublicHomePage from '@/components/PublicHomePage'
import { tripsApi } from '@/lib/api'

async function getHomeData() {
  try {
    const featured = await tripsApi.featured()
    return { featured: featured ?? [] }
  } catch {
    return { featured: [] }
  }
}

export default async function HomePage() {
  const { featured } = await getHomeData()

  return (
    <main>
      <PublicHomePage featuredTrips={featured} />
    </main>
  )
}
