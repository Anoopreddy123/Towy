import Link from "next/link"
import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-center md:ml-[100px]">
          <div className="max-w-lg md:pr-1 order-2 md:order-1">
            <div className="text-green-600 mb-2 text-base md:text-lg font-extrabold">ABOUT TOWY</div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Your trusted Long Beach towing service
            </h2>
            <p className="text-gray-600 mb-6 text-base md:text-xl">
              At Towy, we take pride in offering top-notch towing services in Long Beach. Our experienced team is dedicated to providing fast, reliable, and professional towing assistance whenever you need it. Whether you&apos;re stuck on the highway or need help with vehicle recovery, Towy is here to help. Trust us to handle your towing needs with care and efficiency.
            </p>
            <Link 
              href="/contact" 
              className="inline-block text-green-600 hover:text-green-700 font-bold text-base md:text-lg"
            >
              Get in touch
            </Link>
          </div>
          <div className="relative h-[300px] md:h-[600px] w-full md:w-[600px] order-1 md:order-2">
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