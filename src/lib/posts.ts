/**
 * Dữ liệu bài viết cho các danh sách/sidebar.
 *
 * Trước đây cùng 6 bài bị khai ở SÁU nơi (knowledge.ts, mustReads.ts,
 * reviewPage.sidebarArticles, ARTICLE_MAP trong PostSidebar.astro, frontmatter,
 * và các chuỗi alt). Giờ tất cả lấy từ collection `posts`.
 *
 * Alt được sinh theo đúng quy ước RIÊNG của từng vị trí — bản gốc dùng 5 quy
 * ước khác nhau cho cùng một bài, và chúng phải giữ nguyên từng ký tự.
 */
import { getCollection, getEntries, getEntry } from "astro:content";
import { formatArticleDate } from "./article-date";
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

/**
 * Hai danh sách TUYỂN CHỌN (3 trên 6 bài, thứ tự không theo ngày) nằm ở
 * `content/blocks/curated-posts.yaml`. Trước đây chúng là mảng chuỗi ngay trong
 * file này - biên tập nằm trong code, đúng thứ CLAUDE.md của repo cấm.
 *
 * Lưới /knowledge/ thì KHÔNG có danh sách nào: nó là mục lục nên phải đủ mọi bài,
 * và thứ tự do `date` quyết. Nhờ vậy thêm một bài là thêm ĐÚNG một file.
 */
async function curated(key: "mustReads" | "reviewSidebar") {
  const list = (await getEntry("curatedPosts", "curated-posts"))!.data[key];
  return getEntries(list);
}

/** Lưới /knowledge/ — alt: "{title} | Article Thumbnail" */
export async function getKnowledgeCards(): Promise<KnowledgeCard[]> {
  /* MỌI bài, mới nhất trước. Không có danh sách khai tay nên bài thứ 7 tự vào lưới. */
  const all = await getCollection("posts");
  all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return all.map((e) => ({
    image: e.data.images.card,
    imageAlt: `${e.data.title} | Article Thumbnail`,
    date: formatArticleDate(e.data.date),
    readTime: e.data.readTime,
    title: e.data.title,
    excerpt: e.data.excerpt,
    href: postUrl(e.id),
  }));
}

/** Sidebar trang chủ — alt: "{title} | Article Thumbnail", trích đoạn DÀI */
export async function getMustReads(): Promise<MustRead[]> {
  return (await curated("mustReads")).map((e) => ({
    title: e.data.title,
    excerpt: e.data.excerptLong!,
    image: e.data.images.mustRead!,
    imageAlt: `${e.data.title} | Article Thumbnail`,
    href: postUrl(e.id),
  }));
}

/** Sidebar trang review — alt là TIÊU ĐỀ TRẦN, không hậu tố (khác 4 chỗ kia) */
export async function getReviewSidebarArticles(): Promise<SidebarArticle[]> {
  return (await curated("reviewSidebar")).map((e) => ({
    image: e.data.images.reviewSidebar!,
    imageAlt: e.data.title,
    title: e.data.title,
    href: postUrl(e.id),
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
        href: postUrl(p.id),
      };
    }),
  );
}
