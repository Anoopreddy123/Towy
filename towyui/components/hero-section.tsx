import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[60vh] md:h-[80vh] overflow-hidden"> 
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/backgrounds/tow.jpeg')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center container mx-auto px-4 md:px-8 lg:px-40">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Fast & reliable towing
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white mb-6 md:mb-8">
            Get towed with ease
          </p>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-md text-sm md:text-base font-medium transition-colors uppercase w-full md:w-auto"
          >
            View Services
          </Button>
        </div>
      </div>
    </section>
  )
}