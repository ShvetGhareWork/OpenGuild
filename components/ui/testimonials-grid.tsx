"use client";

import Image from "next/image";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
  bgColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "I went from bootcamp grad to hired at a YC startup in 3 months. OpenGuild gave me real projects to build my portfolio and connected me with an amazing team.",
    name: "Sarah Chen",
    role: "Full-Stack Developer",
    company: "YC Startup",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    bgColor: "bg-bg-tertiary",
  },
  {
    quote: "Finally, a platform where my work matters more than my degree. I've shipped 5 projects, earned 2,000 tokens, and landed 3 freelance clients.",
    name: "Marcus Rodriguez",
    role: "Product Designer",
    company: "Freelance",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bgColor: "bg-accent-blue/20",
  },
  {
    quote: "Their team is highly professional, and their innovative approach has truly transformed the way I collaborate with other builders.",
    name: "Priya Sharma",
    role: "Founder",
    company: "TechVenture",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bgColor: "bg-bg-tertiary",
  },
  {
    quote: "I found my co-founder and first engineer on OpenGuild. The AI matching was spot-on. We raised $500K seed funding 6 months later.",
    name: "Alex Kim",
    role: "Co-Founder",
    company: "StartupXYZ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bgColor: "bg-bg-tertiary",
  },
  {
    quote: "The reputation system is a game-changer. My verified contributions speak louder than any resume ever could.",
    name: "Jordan Lee",
    role: "Backend Engineer",
    company: "Tech Corp",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    bgColor: "bg-bg-tertiary",
  },
  {
    quote: "OpenGuild has been a key partner in my growth journey. The mentorship and project opportunities are unmatched.",
    name: "Taylor Swift",
    role: "Frontend Developer",
    company: "Digital Agency",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    bgColor: "bg-accent-violet/20",
  },
  {
    quote: "The skill verification and token economy make this the most innovative platform for builders. Highly recommended!",
    name: "Chris Johnson",
    role: "DevOps Engineer",
    company: "Cloud Solutions",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bgColor: "bg-bg-tertiary",
  },
];

export default function TestimonialsGrid() {
  return (
    <section id="testimonials" className="relative py-20 px-6 bg-bg-primary">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <article className="max-w-screen-md mx-auto text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-medium">
            Join 10,000+ builders {" "}
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
              Shipping Daily
            </span>
          </h2>
          <p className="text-xl text-text-secondary">
            Let's hear how OpenGuild builders feel about the platform
          </p>
        </article>

        {/* Testimonials Grid */}
        <div className="lg:grid lg:grid-cols-3 gap-4 flex flex-col w-full">
          {/* Column 1 */}
          <div className="md:flex lg:flex-col lg:space-y-4 h-full lg:gap-0 gap-4">
            <div className="lg:flex-[7] flex-[6] flex flex-col justify-between relative glass overflow-hidden rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
              <article className="mt-auto relative z-10">
                <p className="text-text-secondary mb-6">{testimonials[0].quote}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary">
                      {testimonials[0].name}
                    </h3>
                    <p className="text-sm text-text-tertiary">{testimonials[0].role}</p>
                  </div>
                  <Image
                    src={testimonials[0].image}
                    alt={testimonials[0].name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                </div>
              </article>
            </div>
            <div className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-accent-cyan/20 overflow-hidden rounded-2xl border border-accent-cyan/30 p-6 hover:bg-accent-cyan/30 transition-all">
              <article className="mt-auto">
                <p className="text-text-primary mb-6">{testimonials[1].quote}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-semibold text-lg">{testimonials[1].name}</h3>
                    <p className="text-sm text-text-secondary">{testimonials[1].role}</p>
                  </div>
                  <Image
                    src={testimonials[1].image}
                    alt={testimonials[1].name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                </div>
              </article>
            </div>
          </div>

          {/* Column 2 */}
          <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-4 lg:gap-0 gap-4">
            {[testimonials[2], testimonials[3], testimonials[4]].map((testimonial, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between relative glass overflow-hidden rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all"
              >
                <article className="mt-auto">
                  <p className="text-sm text-text-secondary mb-6">
                    {testimonial.quote}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-semibold text-lg text-text-primary">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-text-tertiary">{testimonial.role}</p>
                    </div>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  </div>
                </article>
              </div>
            ))}
          </div>

          {/* Column 3 */}
          <div className="h-full md:flex lg:flex-col lg:space-y-4 lg:gap-0 gap-4">
            <div className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-accent-violet/20 overflow-hidden rounded-2xl border border-accent-violet/30 p-6 hover:bg-accent-violet/30 transition-all">
              <article className="mt-auto">
                <p className="text-text-primary mb-6">{testimonials[5].quote}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-semibold text-lg">{testimonials[5].name}</h3>
                    <p className="text-sm text-text-secondary">{testimonials[5].role}</p>
                  </div>
                  <Image
                    src={testimonials[5].image}
                    alt={testimonials[5].name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                </div>
              </article>
            </div>
            <div className="lg:flex-[7] flex-[6] flex flex-col justify-between relative glass overflow-hidden rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
              <article className="mt-auto relative z-10">
                <p className="text-text-secondary mb-6">{testimonials[6].quote}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary">
                      {testimonials[6].name}
                    </h3>
                    <p className="text-sm text-text-tertiary">{testimonials[6].role}</p>
                  </div>
                  <Image
                    src={testimonials[6].image}
                    alt={testimonials[6].name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
