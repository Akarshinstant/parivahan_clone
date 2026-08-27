import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in with DigiLocker — Government of India',
}

export default function DigiLockerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
