'use client'

import dynamic from 'next/dynamic'

const TheraBookHome = dynamic(() => import('@/components/therabook/TheraBookHome'), {
  ssr: false,
  loading: () => <div className="p-8">Loading TheraBook…</div>,
})

export default function Page() {
  return <TheraBookHome />
}