import type { ImageMetadata } from "astro";

import thePetsTable from "../assets/logos/the-pets-table.svg";
import ollie from "../assets/logos/ollie.svg";
import weFeedRaw from "../assets/logos/we-feed-raw.svg";
import spotTango from "../assets/logos/spot-tango.svg";
import freshpet from "../assets/logos/freshpet.svg";
import sundaysForDogs from "../assets/logos/sundays-for-dogs.svg";

export interface ReviewEntry {
  logo: ImageMetadata;
  logoAlt: string;
  text: string;
  /** Trang bài đánh giá chi tiết */
  readMoreHref: string;
  /** Chuỗi để giữ đúng "8.0"; vòng điểm dùng giá trị này để tính phần trăm */
  rating: string;
  ratingLabel: string;
  /** Số sao 0–5, bước 0.5 — không suy ra được từ rating nên lưu riêng */
  stars: number;
  href: string;
  /** Bản gốc có thêm một đoạn `&nbsp;` rỗng sau nội dung (rác CMS) — trông thừa
      nhưng chiếm 27.2px nên card cao 314.83 thay vì 310. Chỉ Ollie có. */
  trailingBlank?: boolean;
}

/** Trang /reviews/ có thứ tự và điểm RIÊNG, không trùng danh sách trang chủ
    (vd Ollie 9.3 ở đây nhưng Spot & Tango mới là 9.3 ở trang chủ) */
export const reviews: ReviewEntry[] = [
  {
    logo: thePetsTable,
    logoAlt: "The Pet's Table logo",
    text: "Founded by HelloFresh veterans Laurent Guillemain, Anisha Chandra, and Dovas Zakas, The Pets Table was created to extend HelloFresh’s mission beyond human meals to include pets as well. Many pet owners consider kibble the most convenient and nutritious choice, believing their dogs thrive on it. However, the lengthy list of hard-to-pronounce ingredients in most kibble brands raises concerns. Over time, these ingredients may contribute to chronic inflammation or health issues in pets.",
    readMoreHref: "/the-pets-table-review/",
    rating: "9.9",
    ratingLabel: "Outstanding",
    stars: 5,
    href: "#",
  },
  {
    logo: ollie,
    logoAlt: "Ollie  logo",
    text: "We cherish our dogs as part of the family, but do we put as much thought into their meals as we do our own? Ollie, a premium subscription-based dog food brand, aims to transform the way our furry friends eat. The company claims benefits like better weight management, a longer life, and improved digestion—boasting that 90% of its customers notice positive changes in their dogs, including increased energy, better digestion, and improved allergy and weight control.",
    readMoreHref: "/ollie-review/",
    rating: "9.3",
    ratingLabel: "Excellent",
    stars: 4.5,
    href: "#",
    trailingBlank: true,
  },
  {
    logo: weFeedRaw,
    logoAlt: "We Feed Raw  logo",
    text: "We Feed Raw enhances its meals by adding essential vitamins and minerals to ensure a balanced diet. While some may assume that feeding grocery store ground beef is enough, it often lacks the full range of nutrients needed for optimal canine health. Though human-grade, store-bought meat doesn’t provide the carefully formulated nutrition that We Feed Raw delivers.",
    readMoreHref: "/we-feed-raw-review/",
    rating: "8.7",
    ratingLabel: "Excellent",
    stars: 4,
    href: "#",
  },
  {
    logo: spotTango,
    logoAlt: "Spot & Tango logo",
    text: "Spot & Tango’s dog food subscription service is among the top choices for dog food. They focus on preparing fresh, nutritious meals tailored to each dog’s needs and deliver them directly to your door for added convenience.",
    readMoreHref: "/spot-tango-review/",
    rating: "8.4",
    ratingLabel: "Very Good",
    stars: 4,
    href: "#",
  },
  {
    logo: freshpet,
    logoAlt: "Fresh Pet logo",
    text: "Freshpet is one of the most recognized fresh dog food brands in the United States. The brand focuses on refrigerated meals made with real meat and vegetables. Freshpet markets its food as healthier than dry kibble and easier than homemade meals. It is sold mainly through grocery and pet stores rather than direct shipping. Many dog owners choose Freshpet for better taste and visible ingredient quality. This review explains how Freshpet works, what it costs, and who benefits most.",
    readMoreHref: "/freshpet-review/",
    rating: "8.0",
    ratingLabel: "Very Good",
    stars: 4,
    href: "#",
  },
  {
    logo: sundaysForDogs,
    logoAlt: "Sundays For Dogs logo",
    text: "Sunday for Dogs is a premium air-dried dog food brand created by a practicing veterinarian. The brand focuses on real meat, whole ingredients, and minimal processing. It promises better digestion, steady energy, and easier feeding than fresh dog food. The food stays shelf-stable and does not require freezing or cooking. However, pricing and customer service raise concerns for some buyers. This review explains what works, what doesn’t, and who should consider it.",
    readMoreHref: "/sunday-for-dogs-review/",
    rating: "7.9",
    ratingLabel: "Good",
    stars: 4,
    href: "#",
  },
];
