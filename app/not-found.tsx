import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="text-6xl" aria-hidden="true">404</div>
      <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary inline-block py-3 px-6">Go to Home</Link>
    </div>
  )
}
