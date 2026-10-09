// app/components/HomeSectionsCarouselWrapper.tsx
// Server Component — fetcha datos y los pasa al carousel cliente

import { tripsApi } from '@/lib/api'
import { HomeSectionsCarousel } from '@/components/HomeSectionsCarousel'
import type { Trip } from '@/types'

export async function HomeSectionsCarouselWrapper() {
  let featured: Trip[] = []

  try {
    featured = (await tripsApi.featured()) ?? []
  } catch {
    featured = []
  }

  return <HomeSectionsCarousel trips={featured} />
}