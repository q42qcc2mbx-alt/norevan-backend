import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AuditSection from "@/components/AuditSection";
import WhyUs from "@/components/WhyUs";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Process from "@/components/Process";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AuditSection />
        <WhyUs />
        <Services />
        <Portfolio />
        <Stats />
        <Testimonials />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
