import Link from "next/link"
import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 items-center ml-[100px]">
          <div className="max-w-lg pr-1">
            <div className="text-green-600 mb-2 text-lg font-extrabold">ABOUT TOWY</div>
            <h2 className="text-4xl font-bold mb-4">
              Your trusted Long Beach towing service
            </h2>
            <p className="text-gray-600 mb-6 text-xl">
              At Towy, we take pride in offering top-notch towing services in Long Beach. Our experienced team is dedicated to providing fast, reliable, and professional towing assistance whenever you need it. Whether you&apos;re stuck on the highway or need help with vehicle recovery, Towy is here to help. Trust us to handle your towing needs with care and efficiency.
            </p>
            <Link 
              href="/contact" 
              className="inline-block text-green-600 hover:text-green-700 font-bold text-lg"
            >
              Get in touch
            </Link>
          </div>
          <div className="relative h-[600px] w-[600px]">
            <Image
              src="/images/backgrounds/porsche.jpeg"
              alt="Tow truck lifting a car"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}