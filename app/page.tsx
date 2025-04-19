import HeroSection from "@/components/sections/hero-section"
import StorySection from "@/components/sections/story-section"
import DemoSection from "@/components/sections/demo-section"
import PlansSection from "@/components/sections/plans-section"
import TestimonialsSection from "@/components/sections/testimonials-section"
import CtaSection from "@/components/sections/cta-section"
import FooterSection from "@/components/sections/footer-section"
import TechStackSection from "@/components/sections/tech-stack-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <StorySection />
      <DemoSection />
      <PlansSection />
      <TestimonialsSection />
      <CtaSection />
      <TechStackSection />
      <FooterSection />
    </main>
  )
}
