import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoWall from "@/components/LogoWall";
import ProductDemo from "@/components/ProductDemo";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <LogoWall />
      <ProductDemo />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
