import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Parivahan Sewa | NIC eAuth Portal',
}

// SSO login uses a standalone layout — no nav bar, no footer
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
