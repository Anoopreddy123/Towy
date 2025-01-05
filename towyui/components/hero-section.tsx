import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[80vh] overflow-hidden"> 
      {/* Background image - absolute instead of fixed */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/backgrounds/tow.jpeg')",
        }}
      />
      {/* Dark overlay - absolute instead of fixed */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Scrollable content */}
      <div className="relative h-full flex flex-col justify-center container mx-auto px-40 pl-50">
        <div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Fast & reliable towing
          </h1>
          <p className="text-2xl text-white mb-4">
            Get towed with ease
          </p>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors uppercase"
          >
            View Services
          </Button>
        </div>
      </div>
    </section>
  )
}