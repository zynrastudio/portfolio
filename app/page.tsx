import Hero from "@/components/ui/neural-network-hero";
import Header from "@/components/ui/header";
import AboutSection from "@/components/ui/about-section";
import SkillsSection from "@/components/ui/skills-section";
import ProjectsSection from "@/components/ui/projects-section";
import TestimonialsSection from "@/components/ui/testimonials-section";
import ContactSection from "@/components/ui/contact-section";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero 
          title="Crafting Elegant Digital Solutions"
          description="Zynra Studio specializes in web and mobile development. We transform your vision into powerful, user-friendly applications that drive results."
          badgeText="Available for Projects"
          badgeLabel="Open"
          ctaButtons={[
            { text: "View Our Work", href: "/projects", primary: true },
            { text: "Book a Call", href: "/contact" }
          ]}
          microDetails={["Web Development", "Mobile Apps", "UI/UX Design"]}
        />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
