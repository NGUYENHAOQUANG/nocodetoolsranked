/**
 * Dữ liệu bài viết cho các danh sách/sidebar.
 *
 * Trước đây cùng 6 bài bị khai ở SÁU nơi (knowledge.ts, mustReads.ts,
 * reviewPage.sidebarArticles, ARTICLE_MAP trong BlogSidebar.astro, frontmatter,
 * và các chuỗi alt). Giờ tất cả lấy từ collection `blog`.
 *
 * Alt được sinh theo đúng quy ước RIÊNG của từng vị trí — bản gốc dùng 5 quy
 * ước khác nhau cho cùng một bài, và chúng phải giữ nguyên từng ký tự.
 */
import { getCollection, getEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { postUrl } from "@/lib/links";

export interface KnowledgeCard {
  image: ImageMetadata;
  imageAlt: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  href: string;
}

export interface MustRead {
  title: string;
  excerpt: string;
  image: ImageMetadata;
  imageAlt: string;
  href: string;
}

export interface SidebarArticle {
  image: ImageMetadata;
  imageAlt: string;
  title: string;
  href: string;
}

/** Đường dẫn trang bài viết — đi qua lib/links.ts (nguồn duy nhất) */
export const postHref = postUrl;

/** Thứ tự lưới /knowledge/ của bản gốc (3 cột × 2 hàng) */
const KNOWLEDGE_ORDER = [
  "understanding-fresh-pet-food-is-it-a-healthier-choice",
  "fresh-vs-freeze-dried-dog-food-how-do-they-compare",
  "supporting-your-dogs-gut-health-for-a-happier-life",
  "why-fresh-food-is-the-best-for-dogs",
  "what-makes-healthy-pet-food",
  "a-detailed-look-at-dog-food-alternatives",
];

/** Thứ tự sidebar "Must Reads" trang chủ */
const MUST_READS_ORDER = [
  "what-makes-healthy-pet-food",
  "why-fresh-food-is-the-best-for-dogs",
  "a-detailed-look-at-dog-food-alternatives",
];

/** Thứ tự bài ở sidebar trang review */
const REVIEW_SIDEBAR_ORDER = [
  "a-detailed-look-at-dog-food-alternatives",
  "what-makes-healthy-pet-food",
  "why-fresh-food-is-the-best-for-dogs",
];

async function ordered(ids: string[]) {
  const all = await getCollection("posts");
  const byId = new Map(all.map((e) => [e.id, e]));
  return ids.map((id) => {
    const e = byId.get(id);
    if (!e) throw new Error(`Không có bài "${id}" trong collection blog`);
    return e;
  });
}

/** Lưới /knowledge/ — alt: "{title} | Fresh Dog Food Delivery | Article Thumbnail" */
export async function getKnowledgeCards(): Promise<KnowledgeCard[]> {
  return (await ordered(KNOWLEDGE_ORDER)).map((e) => ({
    image: e.data.images.card,
    imageAlt: `${e.data.title} | Fresh Dog Food Delivery | Article Thumbnail`,
    date: e.data.date,
    readTime: e.data.readTime,
    title: e.data.title,
    excerpt: e.data.excerpt,
    href: postHref(e.id),
  }));
}

/** Sidebar trang chủ — alt: "{title} | Article Thumbnail", trích đoạn DÀI */
export async function getMustReads(): Promise<MustRead[]> {
  return (await ordered(MUST_READS_ORDER)).map((e) => ({
    title: e.data.title,
    excerpt: e.data.excerptLong!,
    image: e.data.images.mustRead!,
    imageAlt: `${e.data.title} | Article Thumbnail`,
    href: postHref(e.id),
  }));
}

/** Sidebar trang review — alt là TIÊU ĐỀ TRẦN, không hậu tố (khác 4 chỗ kia) */
export async function getReviewSidebarArticles(): Promise<SidebarArticle[]> {
  return (await ordered(REVIEW_SIDEBAR_ORDER)).map((e) => ({
    image: e.data.images.reviewSidebar!,
    imageAlt: e.data.title,
    title: e.data.title,
    href: postHref(e.id),
  }));
}

/** Sidebar bài viết — 2 bài gợi ý lấy từ `relatedPosts` của chính bài đó */
export async function getRelatedPosts(postId: string): Promise<SidebarArticle[]> {
  const entry = await getEntry("posts", postId);
  if (!entry) throw new Error(`Không có bài "${postId}"`);
  return Promise.all(
    entry.data.relatedPosts.map(async (ref) => {
      const id = typeof ref === "string" ? ref : (ref as { id: string }).id;
      const p = await getEntry("posts", id);
      if (!p) throw new Error(`relatedPosts trỏ tới bài không tồn tại: "${id}"`);
      return {
        image: p.data.images.blogSidebar ?? p.data.images.mustRead ?? p.data.images.card,
        imageAlt: `${p.data.title} | Article Thumbnail`,
        title: p.data.title,
        href: postHref(p.id),
      };
    }),
  );
}
