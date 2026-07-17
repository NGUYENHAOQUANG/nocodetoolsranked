import type { ImageMetadata } from "astro";

import foodTypesIcon from "../assets/icons/food-types.svg";
import qualityIcon from "../assets/icons/quality.svg";
import plansIcon from "../assets/icons/plans.svg";
import valueIcon from "../assets/icons/value.svg";

export interface ReviewCategory {
  title: string;
  icon: ImageMetadata;
  /** Điểm 0–10; quyết định màu ô điểm (≥9 xanh, ≥7 vàng, còn lại xám) */
  score: number;
  description: string;
}

export interface MiniReview {
  categories: ReviewCategory[];
  pros: string[];
  cons: string[];
  /** Chỉ hiện dưới 768px, trong drawer "Summary" (bản desktop thay bằng Pros/Cons) */
  summary: string;
}

/** Bản đánh giá chi tiết của brand hạng 1 (The Pet's Table) — lấy logo/điểm/số
    sao/link từ `brands[0]`, phần dưới đây chỉ bổ sung nội dung riêng của section */
export const miniReview: MiniReview = {
  categories: [
    {
      title: "Food Types",
      icon: foodTypesIcon,
      score: 10,
      description:
        "Offers fresh, air-dried, and freeze-dried meals for different needs. Recipes use real meat, simple vegetables, and clean ingredients. Options fit puppies, adults, and dogs with sensitive stomachs.",
    },
    {
      title: "Quality",
      icon: qualityIcon,
      score: 10,
      description:
        "Meals created with high-quality proteins and balanced nutrients. No fillers, artificial flavors, or cheap ingredients used. Foods prepared under strict safety standards for consistent quality.",
    },
    {
      title: "Plans",
      icon: plansIcon,
      score: 9,
      description:
        "Plans tailored to your dog’s age, weight, and activity level. Subscriptions stay flexible with easy adjustments anytime. Supports mixed feeding for owners wanting varied meal styles.",
    },
    {
      title: "Value",
      icon: valueIcon,
      score: 10,
      description:
        "Strong value considering the high-quality ingredients used. Pricing stays fair compared to other premium dog food brands. Clear billing with no hidden charges or surprise add-ons.",
    },
  ],
  pros: [
    "High-quality ingredients",
    "Multiple meal styles",
    "No fillers or artificial additives",
    "Flexible subscription plans",
  ],
  cons: [
    "Costs more than basic kibble",
    "Some recipes may sell out",
    "Requires freezer space for fresh meals",
  ],
  summary:
    "Founded by HelloFresh veterans Laurent Guillemain, Anisha Chandra, and Dovas Zakas, The Pets Table was created to extend HelloFresh’s mission beyond human meals to include pets as well. Many pet owners consider kibble the most convenient and nutritious choice, believing their dogs thrive on it. However, the lengthy list of hard-to-pronounce ingredients in most kibble brands raises concerns. Over time, these ingredients may contribute to chronic inflammation or health issues in pets.",
};
