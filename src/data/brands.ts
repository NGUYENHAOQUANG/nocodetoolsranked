import type { ImageMetadata } from "astro";

import thePetsTable from "../assets/logos/the-pets-table.svg";
import spotTango from "../assets/logos/spot-tango.svg";
import ollie from "../assets/logos/ollie.svg";
import sundaysForDogs from "../assets/logos/sundays-for-dogs.svg";
import maxbone from "../assets/logos/maxbone.svg";
import weFeedRaw from "../assets/logos/we-feed-raw.svg";
import freshpet from "../assets/logos/freshpet.svg";
import freshpetMobile from "../assets/logos/freshpet-mobile.svg";
import maev from "../assets/logos/maev.svg";
import honestKitchen from "../assets/logos/honest-kitchen.svg";
import honestKitchenMobile from "../assets/logos/honest-kitchen-mobile.svg";

export interface Brand {
  /** Thứ hạng hiển thị trong huy hiệu góc trái card */
  rank: number;
  name: string;
  logo: ImageMetadata;
  /** Chỉ khai báo khi bản mobile khác bản desktop (Fresh Pet, The Honest Kitchen) */
  logoMobile?: ImageMetadata;
  logoAlt: string;
  /** Dòng tiêu đề; bản gốc render với `white-space: pre-line` nên khoảng trắng đầu/cuối được giữ nguyên */
  tagline: string;
  taglineMobile: string;
  /** Bản mobile in đậm hay không. Bản desktop luôn đậm, còn mobile thì tuỳ brand
      (bản gốc chỉ The Pet's Table đậm, 8 brand còn lại để thường) */
  taglineMobileBold?: boolean;
  bullets: string[];
  /** Chỉ khai báo khi danh sách mobile khác desktop */
  bulletsMobile?: string[];
  coupon?: string;
  /** Chuỗi để giữ đúng "8.0"; vòng điểm dùng giá trị này để tính phần trăm */
  rating: string;
  ratingLabel: string;
  /** Số sao 0–5, bước 0.5. Trang gốc để rời khỏi `rating` (8.7 và 7.8 cùng 4 sao
      nhưng 7.7 lại 3.5) nên không suy ra được — phải lưu riêng. */
  stars: number;
  reviews: string;
  href: string;
  /** Card #1: viền cyan + nhãn "Exclusive Offer" + icon sao góc phải */
  editorsChoice?: boolean;
  /** Tooltip nổi trên nút "Visit Site" — chỉ brand nào được cấu hình mới có */
  hoverTooltip?: { highlight: string; text: string };
}

export const brands: Brand[] = [
  {
    rank: 1,
    name: "The Pet's Table",
    logo: thePetsTable,
    logoAlt: "The Pet's Table Official Logo | Fresh Dog Food Delivery",
    tagline: " Best Fresh Food Brand",
    taglineMobile: " Human-grade fresh dog food",
    taglineMobileBold: true,
    bullets: [
      "100% money back guarantee",
      "On-staff board certified vet nutritionist®",
      "9 recipes - more variety than most competitors",
      "+30,000,000 meals delivered to happy customers",
      "Human-grade fresh and affordable air-dried options",
    ],
    bulletsMobile: [
      "Fresh, Air-Dried, Mixed, and Topper plans",
      "EasyFresh™ - Human-Grade, Shelf-Stable",
      "10+ Recipes, More Variety Than Most",
    ],
    coupon: "Get 60% off your 1st box + 20% off your 2nd",
    rating: "9.9",
    ratingLabel: "Outstanding",
    stars: 5,
    reviews: "2,452",
    href: "#",
    editorsChoice: true,
    hoverTooltip: {
      highlight: "16,024 people",
      text: " visited this site today",
    },
  },
  {
    rank: 2,
    name: "Spot & Tango",
    logo: spotTango,
    logoAlt: "Spot & Tango Official Logo | Fresh Dog Food Delivery",
    tagline: " Over 150,000,000  Meals Served ",
    taglineMobile: "Over 150,000,000 Meals Served ",
    bullets: [
      "Vet-approved, nutrient-rich wet dog food",
      "Tailored portions to your dog’s needs and traits",
      "Fresh & UnKibble delivered straight to your door",
    ],
    coupon: "Get 60% Off + Personalized Plan ",
    rating: "9.3",
    ratingLabel: "Excellent",
    stars: 4.5,
    reviews: "2,002",
    href: "#",
  },
  {
    rank: 3,
    name: "Ollie",
    logo: ollie,
    logoAlt: "Ollie  Official Logo | Fresh Dog Food Delivery",
    tagline: " Ensured care graded practice",
    taglineMobile: "Human-grade, vet-approved for optimal health",
    bullets: [
      "Customized to your dog's profile",
      "Human-grade, vet-approved for optimal health",
      "Complete, balanced raw nutrition for dogs",
    ],
    coupon: " 70% off your first box + FREE bowl and Welcome Kit",
    rating: "8.7",
    ratingLabel: "Excellent",
    stars: 4,
    reviews: "1,983",
    href: "#",
  },
  {
    rank: 4,
    name: "Sundays For Dogs",
    logo: sundaysForDogs,
    logoAlt: "Sundays For Dogs Official Logo | Fresh Dog Food Delivery",
    tagline: "30% off First Order",
    taglineMobile: "Get 30% off Your First Order",
    bullets: ["No fillers. Only real food", "Premium meats + superfoods"],
    rating: "8.4",
    ratingLabel: "Very Good",
    stars: 4,
    reviews: "1,902",
    href: "#",
  },
  {
    rank: 5,
    name: "Maxbone",
    logo: maxbone,
    logoAlt: "Maxbone Official Logo | Fresh Dog Food Delivery",
    tagline: "50% Off + Subscription Bags",
    taglineMobile: "50% Off + Subscription Bags",
    bullets: [
      "#1 ingredient farm-raised beef and turkey",
      "No hormones, antibiotics, or synthetics",
    ],
    rating: "8.0",
    ratingLabel: "Very Good",
    stars: 4,
    reviews: "1,850",
    href: "#",
  },
  {
    rank: 6,
    name: "We Feed Raw",
    logo: weFeedRaw,
    logoAlt: "We Feed Raw  Official Logo | Fresh Dog Food Delivery",
    tagline: " Best Raw Food Brand",
    taglineMobile: "Nutritionist formulated + vet approved",
    bullets: [
      "Complete & balanced raw meals",
      "PhD-formulated for optimal nutrition",
    ],
    rating: "7.9",
    ratingLabel: "Good",
    stars: 4,
    reviews: "1,622",
    href: "#",
  },
  {
    rank: 7,
    name: "Fresh Pet",
    logo: freshpet,
    logoMobile: freshpetMobile,
    logoAlt: "Fresh Pet Official Logo | Fresh Dog Food Delivery",
    tagline: " Get 50% Off First Order + FREE Welcome Kit ",
    taglineMobile: "Get 50% Off First Order + FREE Welcome Kit",
    bullets: [
      "Formulated by veterinary nutritionists",
      "Ideal for pets needing weight management",
    ],
    rating: "7.8",
    ratingLabel: "Good",
    stars: 4,
    reviews: "1,494",
    href: "#",
  },
  {
    rank: 8,
    name: "Maev",
    logo: maev,
    logoAlt: "Maev Official Logo | Fresh Dog Food Delivery",
    tagline: " 20% off using: MAEVDELIVERY20",
    taglineMobile: "20% off using: MAEVDELIVERY20",
    bullets: [
      "100% USDA-certified lean protein",
      "Specialized formula tailored for puppies",
    ],
    rating: "7.7",
    ratingLabel: "Good",
    stars: 3.5,
    reviews: "1,159",
    href: "#",
  },
  {
    rank: 9,
    name: "The Honest Kitchen",
    logo: honestKitchen,
    logoMobile: honestKitchenMobile,
    logoAlt: "The Honest Kitchen Official Logo | Fresh Dog Food Delivery",
    tagline: "20% off All Recipes",
    taglineMobile: "20% off All Recipes",
    bullets: [
      "Dry, wet, dehydrated, treats & toppers",
      "First to offer human-grade meals for dogs and cats",
    ],
    rating: "6.1",
    ratingLabel: "Fair",
    stars: 3,
    reviews: "986",
    href: "#",
  },
];
