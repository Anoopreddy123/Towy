import { ContactForm } from "@/components/contact-form"
import Image from "next/image"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/backgrounds/motorcycle-towing.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              Have questions? Need assistance? We&apos;re here to help you get back on the road.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 md:p-8 h-fit">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <ContactInfo icon={<Phone className="h-5 w-5" />} title="Phone" content="+1 (562) 578-0685" href="tel:+15625780685" />
                  <ContactInfo icon={<Mail className="h-5 w-5" />} title="Email" content="info@towy.com" href="mailto:info@towy.com" />
                  <ContactInfo icon={<MapPin className="h-5 w-5" />} title="Location" content="Long Beach, CA" href="https://maps.google.com" />
                  <ContactInfo icon={<Clock className="h-5 w-5" />} title="Hours" content="24/7 Emergency Service" />
                </div>
                <div className="mt-8 p-4 bg-white rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Emergency?</h3>
                  <p className="text-sm text-gray-600">For urgent roadside assistance, call us directly for fastest response.</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Send us a Message</h2>
                  <p className="text-gray-600 text-lg">We&apos;ll get back to you within 24 hours</p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactInfo({ icon, title, content, href }: { icon: React.ReactNode; title: string; content: string; href?: string }) {
  const contentElement = href ? (
    <a href={href} className="text-green-600 hover:text-green-700 font-medium">
      {content}
    </a>
  ) : (
    <span className="text-gray-700 font-medium">{content}</span>
  )

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        {contentElement}
      </div>
    </div>
  )
}


