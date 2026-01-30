"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselContextType } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

interface GalleryHoverCarouselItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

export default function GalleryHoverCarousel({
  heading = "Featured Projects",
  demoUrl = "#",
  items = [
    {
      id: "item-1",
      title: "Build Modern UIs",
      summary:
        "Create stunning user interfaces with our comprehensive design system.",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    },
    {
      id: "item-2",
      title: "Computer Vision Technology",
      summary:
        "Powerful image recognition and processing capabilities that allow AI systems to analyze, understand, and interpret visual information from the world.",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    },
    {
      id: "item-3",
      title: "Machine Learning Automation",
      summary:
        "Self-improving algorithms that learn from data patterns to automate complex tasks and make intelligent decisions with minimal human intervention.",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    },
    {
      id: "item-4",
      title: "Predictive Analytics",
      summary:
        "Advanced forecasting capabilities that analyze historical data to predict future trends and outcomes, helping businesses make data-driven decisions.",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
    },
    {
      id: "item-5",
      title: "Neural Network Architecture",
      summary:
        "Sophisticated AI models inspired by human brain structure, capable of solving complex problems through deep learning and pattern recognition.",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop",
    }
  ],
}: {
  heading?: string;
  demoUrl?: string;
  items?: GalleryHoverCarouselItem[];
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselContextType>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Carousel scroll tracking
  useEffect(() => {
    if (!carouselApi) return;
    const update = () => {
      setCanScrollPrev(carouselApi.index > 0);
      setCanScrollNext(carouselApi.index + 1 < carouselApi.itemsCount);
    };
    update();
  }, [carouselApi]);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-col justify-between md:flex-row md:items-end">
          <div className="max-w-2xl mb-4 md:mb-0">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text-primary mb-2">
              {heading}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary">
              Explore our collection of innovative solutions and cutting-edge technologies designed to transform your business.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => carouselApi && carouselApi.setIndex(carouselApi.index - 1)}
              disabled={!canScrollPrev}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => carouselApi && carouselApi.setIndex(carouselApi.index + 1)}
              disabled={!canScrollNext}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-full max-w-full">
          <Carousel
            className="relative w-full max-w-full"
          >
            <CarouselContent className="w-full max-w-full ml-0 md:ml-4">
              {items.map((item) => (
                <CarouselItem key={item.id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                  <Link href={item.url} className="group block relative w-full h-[300px] md:h-[350px]">
                    <Card className="overflow-hidden rounded-xl h-full w-full">
                      {/* Image */}
                      <div className="relative h-full w-full transition-all duration-500 group-hover:h-1/2">
                        <Image
                          width={400}
                          height={300}
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-center"
                        />
                        {/* Fade overlay at bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Text Section */}
                      <div className="absolute bottom-0 left-0 w-full p-4 transition-all duration-500 group-hover:h-1/2 group-hover:flex flex-col justify-center glass opacity-0 group-hover:opacity-100">
                        <h3 className="text-lg font-semibold md:text-xl text-text-primary">{item.title}</h3>
                        <p className="text-text-secondary text-sm md:text-base line-clamp-2 mt-1">
                          {item.summary}
                        </p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-2 right-2 hover:-rotate-45 transition-all duration-500 rounded-full"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
