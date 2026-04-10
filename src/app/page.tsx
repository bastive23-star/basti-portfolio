import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import CookieBanner from '@/components/ui/CookieBanner'
import ScrollSkew from '@/components/ui/ScrollSkew'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <>
      <CookieBanner />
      <Nav />
      <main>
        <Hero />
        <ScrollSkew>
          <About />
          <Services />
          <Projects />
          <Contact />
        </ScrollSkew>
      </main>
      <Footer />
    </>
  )
}
