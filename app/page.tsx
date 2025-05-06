import dynamic from 'next/dynamic'
import HeroSection from "@/components/sections/hero-section"
import StorySection from "@/components/sections/story-section"
import Header from "@/components/sections/header"

const NewsletterLogosSection = dynamic(() => import('@/components/sections/newsletter-logos-section'), {
  loading: () => <div className="w-full py-12 bg-muted/20">Loading...</div>,
  ssr: true,
})

const DemoSection = dynamic(() => import('@/components/sections/demo-section'), {
  loading: () => <div className="w-full py-20 md:py-32 bg-muted/30">Loading...</div>,
  ssr: true,
})

const PlansSection = dynamic(() => import('@/components/sections/plans-section'), {
  loading: () => <div className="w-full py-20 md:py-32">Loading...</div>,
  ssr: true,
})

const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials-section'), {
  loading: () => <div className="w-full py-20 md:py-32">Loading...</div>,
  ssr: true,
})

const CtaSection = dynamic(() => import('@/components/sections/cta-section'), {
  loading: () => <div className="w-full py-16 md:py-24">Loading...</div>,
  ssr: true,
})

const TechStackSection = dynamic(() => import('@/components/sections/tech-stack-section'), {
  loading: () => <div className="w-full py-16 md:py-24 bg-muted/20">Loading...</div>,
  ssr: true,
})

const FooterSection = dynamic(() => import('@/components/sections/footer-section'), {
  loading: () => <div className="w-full py-12 bg-muted/10">Loading...</div>,
  ssr: true,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header />
      <HeroSection />
      <StorySection />
      <NewsletterLogosSection />
      <DemoSection />
      <PlansSection />
      <TestimonialsSection />
      <CtaSection />
      <TechStackSection />
      <FooterSection />
    </main>
  )
}
