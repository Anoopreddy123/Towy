import Link from "next/link"
import Image from "next/image"

export function ServiceCard({ title, description, image, href }: {
  title: string
  description: string
  image: string
  href: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-[0_20px_50px_rgba(34,197,94,0.2)] transition-all duration-300 hover:-translate-y-2">
      <Link href={href} className="block">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="w-full h-48 md:h-72 object-cover"
        />
        <div className="p-4 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 flex items-center group">
            {title}
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </h3>
          <p className="text-gray-600 text-sm md:text-lg">
            {description}
          </p>
        </div>
      </Link>
    </div>
  )
}