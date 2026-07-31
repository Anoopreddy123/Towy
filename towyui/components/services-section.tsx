import { ServiceCard } from "./service-card"

export function ServicesSection() {
  const services = [
    {
      title: "Emergency towing",
      description: "24/7 emergency towing service for vehicles of all sizes. Quick response and reliable assistance.",
      image: "/images/backgrounds/tow.jpeg",
      href: "/services/emergency-towing"
    },
    {
      title: "Roadside assistance",
      description: "Prompt roadside assistance for various vehicle issues including battery jump starts and tire changes.",
      image: "/images/backgrounds/roadside-asst.jpeg",
      href: "/services/roadside-assistance"
    },
    {
      title: "Vehicle recovery",
      description: "Professional vehicle recovery service for cars and motorcycles. Safe and secure transport to designated locations.",
      image: "/images/backgrounds/vehicle-recovery.jpeg",
      href: "/services/vehicle-recovery"
    },
    {
      title: "Heavy-Duty towing",
      description: "Specialized towing service for heavy-duty vehicles and equipment. Expert handling for large-scale towing needs.",
      image: "/images/backgrounds/heavy-duty.jpeg",
      href: "/services/heavy-duty-towing"
    },
    {
      title: "Motorcycle towing",
      description: "Dedicated towing service for motorcycles of all makes and models. Secure and careful transport for motorcycle owners.",
      image: "/images/backgrounds/motorcycle-towing.jpeg",
      href: "/services/motorcycle-towing"
    },
    {
      title: "Winch and recovery",
      description: "Specialized winch and recovery service for vehicles stuck in challenging situations. Expert recovery for off-road and difficult terrains.",
      image: "/images/backgrounds/porsche.jpeg",
      href: "/services/winch-recovery"
    }
  ]

  return (
    <section className="py-12 md:py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-green-600 text-lg md:text-2xl mb-2 font-extrabold">SERVICES</div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 px-4">
            From our battle-tested process to our reliable client care, we&apos;re here for you
          </h2>
          <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto px-4">
            Our wide range of services are backed by industry knowledge and our passion to help clients find solutions perfectly tailored to their needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}