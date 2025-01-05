"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    // Add form submission logic here
    setIsSubmitting(false)
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="mb-8">
                <div className="text-green-600 text-2xl mb-2 font-extrabold">CONTACT US</div>
                <h2 className="text-4xl font-bold mb-4">
                  Feel free to give us a call or send us an email with your questions or comments.
                </h2>
                <p className="text-gray-600 text-lg">
                  We would love to hear from you, whether you&apos;re interested in working with our team or pursuing a career with us.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input id="name" required placeholder="Enter your name..." />
                </div>
                <div>
                  <Label htmlFor="email">Email address <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" required placeholder="Enter your email address..." />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number <span className="text-red-500">*</span></Label>
                  <Input id="phone" type="tel" required placeholder="Enter your phone number..." />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter your message..." className="h-32" />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="consent" required />
                  <Label htmlFor="consent" className="text-lg">
                    I allow this website to store my submission so they can respond to my inquiry. <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Submitting..." : "SUBMIT"}
                </Button>
              </form>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg self-start mt-8 md:mt-[5.5rem]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Contact us</h3>
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <a href="tel:+15625780685" className="text-xl hover:text-green-600">
                      +15625780685
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Location</h3>
                  <p className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xl hover:text-green-600"
                    >
                      Long Beach, CA US
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}