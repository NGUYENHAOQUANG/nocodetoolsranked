import type { ImageMetadata } from "astro";

// Ảnh thẻ: 3 bài mới dùng ảnh vuông 1200×1200, 3 bài cũ dùng lại ảnh thân bài.
import imgUnderstanding from "@/assets/images/knowledge-understanding.jpg";
import imgFreshVs from "@/assets/images/knowledge-fresh-vs.jpg";
import imgGutHealth from "@/assets/images/knowledge-gut-health.jpg";
import imgWhyFresh from "@/assets/images/blog-why-fresh-1.jpg";
import imgHealthyPet from "@/assets/images/blog-healthy-pet-1.jpg";
import imgAlternatives from "@/assets/images/blog-alternatives-1.jpg";

export interface KnowledgeCard {
  image: ImageMetadata;
  imageAlt: string;
  date: string;
  readTime: string;
  title: string;
  /** Trích đoạn cắt sẵn ~115 ký tự + "…" như bản gốc */
  excerpt: string;
  href: string;
}

/** 6 bài blog, đúng thứ tự lưới ở trang gốc (3 cột × 2 hàng). */
export const knowledgeCards: KnowledgeCard[] = [
  {
    image: imgUnderstanding,
    title: "Understanding Fresh Pet Food: Is It A Healthier Choice?",
    href: "/understanding-fresh-pet-food-is-it-a-healthier-choice/",
    date: "Jan 1, 2026",
    readTime: "6 min read",
    excerpt:
      "With so many pet food options available—kibble, raw, freeze-dried, grain-free, pâté, and more—it’s easy to feel ove...",
  },
  {
    image: imgFreshVs,
    title: "Fresh Vs. Freeze-Dried Dog Food: How Do They Compare?",
    href: "/fresh-vs-freeze-dried-dog-food-how-do-they-compare/",
    date: "Jan 1, 2026",
    readTime: "6 min read",
    excerpt:
      "Being a dog owner in 2026 comes with an overwhelming number of food choices. From traditional kibble to fresh meals...",
  },
  {
    image: imgGutHealth,
    title: "Supporting Your Dog’s Gut Health For A Happier Life",
    href: "/supporting-your-dogs-gut-health-for-a-happier-life/",
    date: "Jan 1, 2026",
    readTime: "6 min read",
    excerpt:
      "A balanced diet and regular exercise are essential for overall well-being—not just for us, but for our dogs too. Ho...",
  },
  {
    image: imgWhyFresh,
    title: "Why Fresh Food Is The Best For Dogs?",
    href: "/why-fresh-food-is-the-best-for-dogs/",
    date: "Jan 1, 2026",
    readTime: "5 min read",
    excerpt:
      "Josh Billings once wrote that dogs are the only things on this planet who will love you more than it loves itself. ...",
  },
  {
    image: imgHealthyPet,
    title: "What Makes Healthy Pet Food?",
    href: "/what-makes-healthy-pet-food/",
    date: "Jan 1, 2026",
    readTime: "6 min read",
    excerpt:
      "Raw or natural diet is a trend that’s popular in a growing number of pet owners. There are numerous benefits to ser...",
  },
  {
    image: imgAlternatives,
    title: "A Detailed Look At Dog Food Alternatives",
    href: "/a-detailed-look-at-dog-food-alternatives/",
    date: "Jan 1, 2026",
    readTime: "6 min read",
    excerpt:
      "As a good pup parent, you want to feed your furry baby the best food that you can afford to fuel a healthy lifestyl...",
  },
].map((c) => ({
  ...c,
  imageAlt: `${c.title} | Fresh Dog Food Delivery | Article Thumbnail`,
}));
