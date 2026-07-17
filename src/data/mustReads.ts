import type { ImageMetadata } from "astro";

import healthyPetFood from "../assets/images/must-reads-healthy-pet-food.jpg";
import freshFood from "../assets/images/must-reads-fresh-food.jpg";
import alternatives from "../assets/images/must-reads-alternatives.jpg";

export interface MustRead {
  title: string;
  excerpt: string;
  image: ImageMetadata;
  imageAlt: string;
  href: string;
}

/** Sidebar "Must Reads" — bản gốc chỉ hiện từ 1025px (và màn hình cao ≥420px) */
export const mustReads: MustRead[] = [
  {
    title: "What Makes Healthy Pet Food?",
    excerpt:
      "Raw or natural diet is a trend that’s popular in a growing number of pet owners. There are numerous benefits to serving this type of food to pets and it’s remarkable how fast you can see results.",
    image: healthyPetFood,
    imageAlt: "What Makes Healthy Pet Food? | Article Thumbnail",
    href: "/what-makes-healthy-pet-food/",
  },
  {
    title: "Why Fresh Food Is The Best For Dogs?",
    excerpt:
      "Josh Billings once wrote that dogs are the only things on this planet who will love you more than it loves itself. With this kind of loyalty, it’s no wonder that pet parents would do anything for their beloved pups.",
    image: freshFood,
    imageAlt: "Why Fresh Food Is The Best For Dogs? | Article Thumbnail",
    href: "/why-fresh-food-is-the-best-for-dogs/",
  },
  {
    title: "A Detailed Look At Dog Food Alternatives",
    excerpt:
      "As a good pup parent, you want to feed your furry baby the best food that you can afford to fuel a healthy lifestyle. You’ve heard of raw food diet, canned, frozen, and dried alternatives that are you’ll find almost anywhere.",
    image: alternatives,
    imageAlt: "A Detailed Look At Dog Food Alternatives | Article Thumbnail",
    href: "/a-detailed-look-at-dog-food-alternatives/",
  },
];
