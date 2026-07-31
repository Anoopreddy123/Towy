import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wrench, Clock, MapPin, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/backgrounds/vehicle-recovery.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8 lg:px-40">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">About TOWY</h1>
            <p className="text-white/90 text-base md:text-xl max-w-3xl">
              We connect drivers with nearby, vetted local mechanics and towing pros—fast, reliable, and community-first.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center md:ml-[100px]">
            <div className="order-2 md:order-1 max-w-xl">
              <div className="text-green-600 mb-2 text-base md:text-lg font-extrabold">OUR STORY</div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Built for drivers. Powered by locals.</h2>
              <p className="text-gray-600 text-base md:text-lg mb-6">
                TOWY was created to make roadside help effortless while boosting local economies. When you request help, we match you with
                nearby professionals—so you get faster arrivals and local experts get steady work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Feature icon={<Wrench className="h-5 w-5" />} title="Trusted mechanics" />
                <Feature icon={<Clock className="h-5 w-5" />} title="Fast response times" />
                <Feature icon={<MapPin className="h-5 w-5" />} title="Local first" />
                <Feature icon={<Shield className="h-5 w-5" />} title="Vetted providers" />
              </div>
            </div>
            <div className="relative h-[300px] md:h-[500px] w-full md:w-[600px] order-1 md:order-2">
              <Image
                src="/images/backgrounds/roadside-asst.jpeg"
                alt="Local tow professionals at work"
                fill
                className="object-cover rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-green-600 text-lg md:text-2xl mb-2 font-extrabold">HOW IT WORKS</div>
            <h2 className="text-2xl md:text-4xl font-bold">From request to rescue—simple and seamless</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            <Step index={1} title="Request" text="Choose towing, jump start, tire change, lockout and more." />
            <Step index={2} title="Match" text="We connect you with nearby vetted providers automatically." />
            <Step index={3} title="Track" text="Stay updated and chat with your pro until help arrives." />
            <Step index={4} title="Go" text="Get back on the road with confidence and clarity." />
          </div>
        </div>
      </section>

      {/* Motto / CTA */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600">
            <div className="absolute inset-0 opacity-15">
              <Image
                src="/images/backgrounds/tow.jpeg"
                alt="Tow background"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative p-8 md:p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h3 className="text-2xl md:text-4xl font-bold mb-2">Supporting local mechanics. Fast, reliable service.</h3>
                <p className="text-white/90 text-base md:text-lg">
                  Our motto is simple: empower local experts and deliver help—quickly and dependably—whenever you need it most.
                </p>
              </div>
              <div className="flex md:justify-end">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/request-service">
                    <Button className="bg-white text-green-700 hover:bg-white/90">Request service</Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-white bg-transparent text-white hover:text-white hover:bg-white/10"
                    >
                      Contact us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 bg-white border rounded-md p-3 shadow-sm">
      <span className="text-green-600">{icon}</span>
      <span className="text-sm md:text-base font-medium">{title}</span>
    </div>
  )
}

function Step({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold mb-3">
        {index}
      </div>
      <h4 className="text-lg md:text-xl font-semibold mb-1">{title}</h4>
      <p className="text-gray-600 text-sm md:text-base">{text}</p>
    </div>
  )
}

