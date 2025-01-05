import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-8 py-4 flex justify-between items-center">
        <div className="pl-12">
          <Link href="/" className="text-3xl font-bold text-black">
            TOWY
          </Link>
        </div>

        <div className="flex gap-8">
          <Link href="/" className="text-black">Home</Link>
          <Link href="/about" className="text-black">About</Link>
          <Link href="/services" className="text-black">Services</Link>
          <Link href="/contact" className="text-black">Contact</Link>
        </div>
      </div>
    </nav>
  )
}

