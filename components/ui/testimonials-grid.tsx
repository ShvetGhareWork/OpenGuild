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
    <section id="testimonials" className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-bg-primary">
      <div className="container mx-auto max-w-7xl">
        {/* Header - Responsive Typography */}
        <article className="max-w-2xl mx-auto text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium leading-tight">
            Join 10,000+ builders{'  '}
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
              Shipping Daily
            </span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary max-w-lg mx-auto">
            Let's hear how OpenGuild builders feel about the platform
          </p>
        </article>

        {/* Responsive Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Featured Testimonial 1 - Large on all sizes */}
          <div className="md:col-span-2 lg:col-span-1 row-span-2 relative glass overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 lg:p-10 hover:bg-white/5 transition-all group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <article className="relative z-10 mt-auto h-full flex flex-col justify-end">
              <p className="text-text-secondary mb-6 lg:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg line-clamp-4 sm:line-clamp-5">{testimonials[0].quote}</p>
              <div className="flex items-end sm:items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-text-primary truncate">{testimonials[0].name}</h3>
                  <p className="text-sm sm:text-base text-text-tertiary">{testimonials[0].role}</p>
                </div>
                <Image
                  src={testimonials[0].image}
                  alt={testimonials[0].name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl object-cover flex-shrink-0 shadow-lg border-2 border-white/20"
                />
              </div>
            </article>
          </div>

          {/* Accent Testimonial 1 */}
          <div className="relative bg-accent-cyan/20 overflow-hidden rounded-2xl sm:rounded-3xl border border-accent-cyan/30 p-6 sm:p-8 hover:bg-accent-cyan/30 transition-all group h-full">
            <article className="h-full flex flex-col justify-end">
              <p className="text-text-primary mb-6 leading-relaxed text-sm sm:text-base line-clamp-4">{testimonials[1].quote}</p>
              <div className="flex items-end sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl text-text-primary truncate">{testimonials[1].name}</h3>
                  <p className="text-sm text-text-secondary">{testimonials[1].role}</p>
                </div>
                <Image
                  src={testimonials[1].image}
                  alt={testimonials[1].name}
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
                />
              </div>
            </article>
          </div>

          {/* Standard Testimonial 1 */}
          <div className="relative glass overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 hover:bg-white/5 transition-all group h-full">
            <article className="h-full flex flex-col justify-end">
              <p className="text-sm sm:text-base text-text-secondary mb-6 leading-relaxed line-clamp-4">{testimonials[2].quote}</p>
              <div className="flex items-end sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl text-text-primary truncate">{testimonials[2].name}</h3>
                  <p className="text-sm text-text-tertiary">{testimonials[2].role}</p>
                </div>
                <Image
                  src={testimonials[2].image}
                  alt={testimonials[2].name}
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
                />
              </div>
            </article>
          </div>

          {/* Standard Testimonial 2 */}
          <div className="relative glass overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 hover:bg-white/5 transition-all group h-full">
            <article className="h-full flex flex-col justify-end">
              <p className="text-sm sm:text-base text-text-secondary mb-6 leading-relaxed line-clamp-4">{testimonials[3].quote}</p>
              <div className="flex items-end sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl text-text-primary truncate">{testimonials[3].name}</h3>
                  <p className="text-sm text-text-tertiary">{testimonials[3].role}</p>
                </div>
                <Image
                  src={testimonials[3].image}
                  alt={testimonials[3].name}
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
                />
              </div>
            </article>
          </div>

          {/* Accent Testimonial 2 */}
          <div className="md:col-span-2 relative bg-accent-violet/20 overflow-hidden rounded-2xl sm:rounded-3xl border border-accent-violet/30 p-6 sm:p-8 hover:bg-accent-violet/30 transition-all group h-full">
            <article className="h-full flex flex-col justify-end">
              <p className="text-text-primary mb-6 leading-relaxed text-sm sm:text-base lg:text-lg line-clamp-4 sm:line-clamp-5">{testimonials[5].quote}</p>
              <div className="flex items-end sm:items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-text-primary truncate">{testimonials[5].name}</h3>
                  <p className="text-sm sm:text-base text-text-secondary">{testimonials[5].role}</p>
                </div>
                <Image
                  src={testimonials[5].image}
                  alt={testimonials[5].name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl object-cover flex-shrink-0 shadow-lg border-2 border-white/20"
                />
              </div>
            </article>
          </div>

          {/* Featured Testimonial 2 - Large */}
          <div className="lg:col-span-1 row-span-2 relative glass overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 lg:p-10 hover:bg-white/5 transition-all group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <article className="relative z-10 mt-auto h-full flex flex-col justify-end">
              <p className="text-text-secondary mb-6 lg:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg line-clamp-4 sm:line-clamp-5">{testimonials[6].quote}</p>
              <div className="flex items-end sm:items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-text-primary truncate">{testimonials[6].name}</h3>
                  <p className="text-sm sm:text-base text-text-tertiary">{testimonials[6].role}</p>
                </div>
                <Image
                  src={testimonials[6].image}
                  alt={testimonials[6].name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl object-cover flex-shrink-0 shadow-lg border-2 border-white/20"
                />
              </div>
            </article>
          </div>

          {/* Remaining testimonials fill naturally */}
          <div className="relative glass overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 hover:bg-white/5 transition-all group h-full">
            <article className="h-full flex flex-col justify-end">
              <p className="text-sm sm:text-base text-text-secondary mb-6 leading-relaxed line-clamp-4">{testimonials[4].quote}</p>
              <div className="flex items-end sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl text-text-primary truncate">{testimonials[4].name}</h3>
                  <p className="text-sm text-text-tertiary">{testimonials[4].role}</p>
                </div>
                <Image
                  src={testimonials[4].image}
                  alt={testimonials[4].name}
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
