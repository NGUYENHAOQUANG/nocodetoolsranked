import type { ImageMetadata } from "astro";

import thePetsTable from "../assets/logos/the-pets-table.svg";
import ollie from "../assets/logos/ollie.svg";
import spotTango from "../assets/logos/spot-tango.svg";
import weFeedRaw from "../assets/logos/we-feed-raw.svg";
import freshpet from "../assets/logos/freshpet.svg";
import sundaysForDogs from "../assets/logos/sundays-for-dogs.svg";

import articleAlternatives from "../assets/images/must-reads-fresh-food.jpg";
import articleHealthy from "../assets/images/must-reads-healthy-pet-food.jpg";
import articleWhyFresh from "../assets/images/article-why-fresh-food.jpg";

export interface SidebarPartner {
  logo: ImageMetadata;
  logoAlt: string;
  name: string;
  href: string;
}

export interface SidebarArticle {
  image: ImageMetadata;
  imageAlt: string;
  title: string;
  href: string;
}

/** Logo + alt của từng đối tác, tra theo key `partner` trong frontmatter bài review.
    Dùng cho logo thanh trên (ReviewIntro). */
export const partnerLogos: Record<string, { logo: ImageMetadata; logoAlt: string }> = {
  "the-pets-table": { logo: thePetsTable, logoAlt: "The Pet's Table logo" },
  // Khoảng trắng cuối alt là của bản gốc
  ollie: { logo: ollie, logoAlt: "Ollie  logo" },
  "spot-tango": { logo: spotTango, logoAlt: "Spot & Tango logo" },
  "we-feed-raw": { logo: weFeedRaw, logoAlt: "We Feed Raw  logo" },
  freshpet: { logo: freshpet, logoAlt: "Fresh Pet logo" },
  "sundays-for-dogs": { logo: sundaysForDogs, logoAlt: "Sundays For Dogs logo" },
};

export interface CarouselPartner {
  key: string;
  logo: ImageMetadata;
  logoAlt: string;
  promo: string;
  href: string;
}

/** Danh sách ĐỦ 6 đối tác cho ô carousel sidebar. Bản gốc là carousel duyệt qua
    cả 6 (bắt đầu từ đối tác của trang hiện tại; mũi tên disable ở hai đầu).
    Thứ tự = sidebarPartners. `href`/`promo` lấy THẲNG từ carousel bản gốc (khác
    `href` ở frontmatter bài — vd Spot & Tango carousel dùng link affiliate thật
    spot-and-tango.i5md.net, còn nút "View Rates" trên trang lại là link tự trỏ). */
export const carouselPartners: CarouselPartner[] = [
  {
    key: "the-pets-table",
    logo: thePetsTable,
    logoAlt: "The Pet's Table logo",
    promo: "100% money back guarantee",
    href: "#",
  },
  {
    key: "ollie",
    logo: ollie,
    logoAlt: "Ollie  logo",
    promo: "Customized to your dog's profile",
    href: "#",
  },
  {
    key: "spot-tango",
    logo: spotTango,
    logoAlt: "Spot & Tango logo",
    promo: "Vet-approved, nutrient-rich wet dog food",
    href: "#",
  },
  {
    key: "we-feed-raw",
    logo: weFeedRaw,
    logoAlt: "We Feed Raw  logo",
    promo: "Complete & balanced raw meals",
    href: "#",
  },
  {
    key: "freshpet",
    logo: freshpet,
    logoAlt: "Fresh Pet logo",
    promo: "Formulated by veterinary nutritionists",
    href: "#",
  },
  {
    key: "sundays-for-dogs",
    logo: sundaysForDogs,
    logoAlt: "Sundays For Dogs logo",
    promo: "No fillers. Only real food",
    href: "#",
  },
];

export const sidebarPartners: SidebarPartner[] = [
  { logo: thePetsTable, logoAlt: "The Pet's Table logo", name: "The Pet's Table", href: "/the-pets-table-review/" },
  // Khoảng trắng cuối tên là của bản gốc
  { logo: ollie, logoAlt: "Ollie  logo", name: "Ollie ", href: "/ollie-review/" },
  { logo: spotTango, logoAlt: "Spot & Tango logo", name: "Spot & Tango", href: "/spot-tango-review/" },
  { logo: weFeedRaw, logoAlt: "We Feed Raw  logo", name: "We Feed Raw ", href: "/we-feed-raw-review/" },
  { logo: freshpet, logoAlt: "Fresh Pet logo", name: "Fresh Pet", href: "/freshpet-review/" },
  { logo: sundaysForDogs, logoAlt: "Sundays For Dogs logo", name: "Sundays For Dogs", href: "/sunday-for-dogs-review/" },
];

/** Cùng bài viết nhưng ảnh KHÁC với sidebar "Must Reads" ở trang chủ — không tái
    dùng `mustReads.ts` được (vd "A Detailed Look…" ở đây dùng ảnh cocker spaniel) */
export const sidebarArticles: SidebarArticle[] = [
  {
    image: articleAlternatives,
    imageAlt: "A Detailed Look At Dog Food Alternatives",
    title: "A Detailed Look At Dog Food Alternatives",
    href: "/a-detailed-look-at-dog-food-alternatives/",
  },
  {
    image: articleHealthy,
    imageAlt: "What Makes Healthy Pet Food?",
    title: "What Makes Healthy Pet Food?",
    href: "/what-makes-healthy-pet-food/",
  },
  {
    image: articleWhyFresh,
    imageAlt: "Why Fresh Food Is The Best For Dogs?",
    title: "Why Fresh Food Is The Best For Dogs?",
    href: "/why-fresh-food-is-the-best-for-dogs/",
  },
];
