import type { ImageMetadata } from "astro";
import imgPartner from "@/assets/images/contact-partner.png";
import imgFeedback from "@/assets/images/contact-feedback.png";
import imgHelp from "@/assets/images/contact-help.png";

export interface ContactCard {
  image: ImageMetadata;
  title: string;
  subtitle: string;
  button: string;
}

/** 3 thẻ liên hệ — đúng thứ tự bản gốc */
export const contactCards: ContactCard[] = [
  {
    image: imgPartner,
    title: "Partner with Us",
    subtitle: "Share more so we can explore ways to work together",
    button: "Get in touch",
  },
  {
    image: imgFeedback,
    title: "Send Feedback",
    subtitle: "Have some ideas about what we can do better?",
    button: "Share thoughts",
  },
  {
    image: imgHelp,
    title: "Help & Support",
    subtitle: "Questions? We're here to help",
    button: "Get help",
  },
];
