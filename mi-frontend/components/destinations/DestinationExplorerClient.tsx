'use client'

import type { Destination } from '@/types'
import { DestinationExplorer as DestinationExplorerInner } from './DestinationExplorer'

export function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  return <DestinationExplorerInner destinations={destinations} />
}
