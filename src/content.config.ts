import { defineCollection, reference, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z, type ZodType } from "astro/zod";

/* ===========================================================================
   Nguyên tắc: TÁCH "đối tượng là ai" khỏi "nó xuất hiện thế nào ở trang nào".

   - `brands`     — danh tính đối tác, khai MỘT LẦN. Link affiliate ở đây và
                    chỉ ở đây.
   - `placements` — brand đó được xếp hạng ra sao ở từng trang. Trang chủ và
                    /reviews/ có thứ tự + điểm KHÁC NHAU; đó là chủ ý của bản
                    gốc, và mô hình này diễn đạt nó tường minh thay vì bằng
                    hai bản sao dữ liệu tình cờ lệch nhau.

   Xem CLAUDE.md §8.4.
   =========================================================================== */

/**
 * Danh tính đối tác.
 *
 * Bốn biến thể tên là bốn trường RIÊNG chứ không phải một, vì nguồn dùng chuỗi khác
 * nhau ở từng vị trí và không suy ra được từ nhau: menu ghi "Base 44" trong khi card
 * toplist ghi "Base44". Bộ dữ liệu hiện tại khai trùng nhau ở phần lớn brand — đó là
 * tình cờ, không phải lý do để gộp trường.
 */
const brands = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/brands" }),
  schema: ({ image }) =>
    z.object({
      /** Tên ở menu điều hướng, vd "Base 44", "Square Online" */
      name: z.string(),
      logo: image(),
      /** Chỉ khai khi bản mobile khác desktop — hiện chỉ Wix có */
      logoMobile: image().optional(),
      /** Dạng dài: "X Official Logo | Website Builder" — toplist trang chủ */
      logoAlt: z.string(),
      /** Dạng ngắn: "X logo" — sidebar, carousel, card /reviews/ */
      logoAltShort: z.string().optional(),
      /** Tên ở sidebar trang review */
      sidebarName: z.string().optional(),
      /** Tên ở link cuối bài review */
      articleLinkName: z.string().optional(),
      /**
       * Banner dọc nổi bên phải card hạng 1 (chỉ hiện từ 1525px). Chỉ brand nào có
       * creative riêng mới khai — brand không có thì card hạng 1 đơn giản là không có
       * banner. Ảnh nằm ở `assets/promos/` vì nó là creative chiến dịch, không phải
       * danh tính brand; xem quy ước hai trục trong CLAUDE.md.
       */
      sideBanner: image().optional(),
      /**
       * NGUỒN DUY NHẤT của link affiliate. Mọi nơi khác tham chiếu tới đây — một
       * brand xuất hiện tới 9 loại khối (nút bảng xếp hạng, card review, mini
       * review, carousel sidebar, side banner, dải promo, inline CTA, "View
       * Rates", link brand cuối bài) và TẤT CẢ đọc đúng trường này.
       *
       * ⚠️ HIỆN ĐANG LÀ TRANG CHỦ CHÍNH THỨC CỦA BRAND, KHÔNG PHẢI LINK AFFILIATE.
       *
       * Trước đây cả 15 brand để `"#"` nên nút "Visit Site" bấm vào không đi đâu.
       * Đã thay bằng URL chính thức để nút hoạt động, nhưng đây CHƯA phải link
       * kiếm tiền: click hiện KHÔNG được gắn tracking, tức traffic đi ra mà không
       * ghi nhận hoa hồng — và không có gì báo lỗi, trang vẫn chạy bình thường.
       *
       * Khi có link affiliate thật (dạng `go.impact.com/...`, `?ref=`, endpoint
       * `/click?` của mạng affiliate...) thì thay thẳng vào từng file
       * `content/brands/*.yaml`. Không phải sửa component nào.
       */
      affiliateUrl: z.string(),
      /** Dòng chữ trong ô carousel sidebar */
      carouselPromo: z.string().optional(),
    }),
});

/** Một dòng trong bảng xếp hạng trang chủ */
const homepageRow = z.object({
  brand: reference("brands"),
  rank: z.number(),
  /** Chuỗi để giữ đúng "8.0"; vòng điểm dùng giá trị này tính phần trăm */
  rating: z.string(),
  ratingLabel: z.string(),
  /**
   * Hai trường dưới TUỲ CHỌN: không khai thì `ScoreRing` chỉ vẽ vòng điểm + nhãn.
   *
   * Đừng điền bừa — đây là số liệu xã hội trên một trang kiếm tiền, bịa ra là nói
   * dối người đọc. Bảng nào không có số thật thì để trống, vòng điểm vẫn đủ dùng.
   *
   * `stars`: 0-5 bước 0.5, KHÔNG suy ra được từ `rating` (8.5 và 7.3 cùng 4 sao,
   * còn 9.7 lại 5 sao) — nên nó phải là dữ liệu chứ không phải phép tính.
   */
  stars: z.number().optional(),
  reviewsCount: z.string().optional(),
  /** Render với white-space: pre-line nên dấu cách đầu/cuối được giữ nguyên */
  tagline: z.string(),
  taglineMobile: z.string(),
  isTaglineMobileBold: z.boolean().default(false),
  bullets: z.array(z.string()),
  bulletsMobile: z.array(z.string()).optional(),
  coupon: z.string().optional(),
  /** Chỉ khai khi bản mobile KHÁC bản desktop (vd Squarespace rút gọn
      "Claim your 20% OFF" thành "Get 20% OFF"). Không khai thì dùng `coupon`. */
  couponMobile: z.string().optional(),
  /**
   * Nhãn nổi ở góc card ("Best Website Builder", "Highly Recommended").
   * RIÊNG từng brand và không buộc vào `isEditorsChoice` — bản gốc gắn nhãn cho
   * hai card đầu nhưng chỉ card #1 có viền nổi bật.
   */
  badge: z.string().optional(),
  /**
   * Icon nhỏ ở góc trên-phải card. KHÔNG khai thì không có icon.
   *
   * Tách khỏi `isEditorsChoice` vì bản gốc gắn icon cho HAI card đầu (sao cho #1,
   * ngọn lửa cho #2) trong khi chỉ #1 có viền nổi bật và tooltip tự mở.
   */
  highlightIcon: z.enum(["star", "flame"]).optional(),
  /** Card #1: viền cyan + tooltip tự mở */
  isEditorsChoice: z.boolean().default(false),
  hoverTooltip: z.object({ highlight: z.string(), text: z.string() }).optional(),
});

/** Một dòng trong danh sách /reviews/ */
const reviewsPageRow = z.object({
  brand: reference("brands"),
  rating: z.string(),
  ratingLabel: z.string(),
  stars: z.number(),
  /** Đoạn mở đầu thân bài review. Nâng lên đây thay vì bóc từ MDX: bóc tự động thì
      đổi câu mở bài là đổi luôn chữ trên card /reviews/ mà không ai định làm vậy.

      MẢNG chứ không phải chuỗi: bản gốc ngắt Wix thành HAI `<p>` (card cao 266px
      thay vì 250px). Nhét cả hai vào một chuỗi thì mất đúng chỗ ngắt đó — đo được
      trên trình duyệt, `astro check` không thấy gì. */
  excerptParagraphs: z.array(z.string()).min(1),
});

/**
 * BA collection riêng, KHÔNG gộp làm một.
 *
 * Bản trước gộp cả ba vào một collection `placements` với
 * `z.union([homepageRow, reviewsPageRow, z.object({ brand })])`. Biến thể thứ ba
 * bắt được mọi thứ có `brand`, nên gõ sai một tên trường (vd `rankk`) sẽ khiến
 * dòng đó trượt hai biến thể đầu, khớp biến thể ba, và Zod strip sạch các trường
 * còn lại — dữ liệu biến mất ÂM THẦM lúc chạy thay vì lỗi build. Đúng ngược lại
 * điều mà schema sinh ra để làm.
 *
 * Tách ra thì mỗi file có đúng một schema chặt, và `loadPlacement` không còn phải
 * ép kiểu `Record<string, any>`.
 *
 * Cả ba vẫn ở chung `src/content/placements/` vì chúng cùng một khái niệm.
 * Hai cái dưới chỉ có đúng một file nên `pattern` trỏ đích danh; `toplist` thì
 * MỖI NGÁCH một file nên nó có thư mục con riêng.
 */
const toplistPlacements = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/placements/toplist" }),
  schema: z.object({ entries: z.array(homepageRow) }),
});

const reviewsPagePlacements = defineCollection({
  loader: glob({ pattern: "reviews-page.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(reviewsPageRow) }),
});

/** Sidebar trang review: chỉ còn THỨ TỰ, mọi thứ khác lấy từ `brands` */
const sidebarPlacements = defineCollection({
  loader: glob({ pattern: "sidebar.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(z.object({ brand: reference("brands") })) }),
});

/**
 * Menu con "Reviews" ở header — danh sách RIÊNG, không dùng chung `sidebar.yaml`.
 *
 * Hai danh sách này khác nhau thật: menu điều hướng dẫn tới 10 bài review, còn
 * sidebar trang review chỉ gợi ý 4 brand. Gộp làm một thì hoặc menu cụt đi 6 mục,
 * hoặc sidebar phình lên 10 — đổi một cái là hỏng cái kia.
 *
 * Cả hai đều là TUYỂN CHỌN (không phải mục lục), nên khai tay là đúng; `reference()`
 * lo phần gõ sai tên brand.
 */
const headerNavPlacements = defineCollection({
  loader: glob({ pattern: "header-nav.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(z.object({ brand: reference("brands") })) }),
});

/** Tác giả. Bài review dùng avatar SVG dùng chung, bài blog dùng PNG riêng —
    một trường `avatar` phục vụ được cả hai. */
const authors = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/authors" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      avatar: image(),
    }),
});

/** Bài review từng brand — MDX. Thân bài là nội dung; TOC tự sinh từ heading.

    Logo, alt, tên hiển thị, link affiliate và promo carousel KHÔNG khai ở đây —
    tất cả lấy từ `brand`. Đó là lớp trùng lặp cuối cùng đã được xoá. */
const reviews = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/reviews" }),
  schema: z.object({
    /** Thẻ <title>. Khác `heroTitle`: chuỗi SEO thường dài hơn và có thêm năm,
        tính năng, giá — vd "Wix Website Builder Review 2026: Features, Pricing…" */
    title: z.string(),
    /** <h1> trên banner, dùng cho CẢ desktop lẫn mobile */
    heroTitle: z.string(),
    /**
     * Meta description của trang. BẮT BUỘC — bản trước dùng luôn `promo` làm mô tả, mà
     * `promo` là chữ trên thanh khuyến mãi: hai brand để trống nên hai trang KHÔNG có
     * description nào, ba brand cùng ghi "Free delivery on all orders" nên ba trang
     * trùng nhau. Bắt buộc ở đây để không trang review nào ship mà thiếu.
     */
    description: z.string(),
    /** Dòng khuyến mãi ở thanh trên cùng bài. CHỈ để hiển thị, không dùng cho SEO. */
    promo: z.string(),
    /** Đối tác của bài. Gõ sai = lỗi build. */
    brand: reference("brands"),
    author: reference("authors"),
    pros: z.array(z.string()),
    cons: z.array(z.string()),

    /**
     * Chấm điểm theo hạng mục, dùng cho khối "Review Highlights" ở trang toplist.
     *
     * TÊN và ICON hạng mục KHÔNG ở đây — chúng là dữ liệu toàn site, nằm ở
     * `blocks/review-categories.yaml`. Ở đây chỉ có phần RIÊNG của brand: điểm và
     * mô tả. Ghép hai thứ lại theo THỨ TỰ, nên mảng này phải đúng 4 phần tử và
     * đúng thứ tự Design / Features / Pricing / Usability.
     *
     * `.length(4)` để lệch số lượng thành lỗi build: thiếu một phần tử thì hạng mục
     * cuối biến mất, thừa một phần tử thì nó không có tên — cả hai đều im lặng.
     *
     * TUỲ CHỌN vì không phải brand nào cũng có bản chấm điểm: brand thiếu thì khối
     * "Review Highlights" BỎ QUA nó, chứ không dựng bốn ô rỗng. Thà vắng còn hơn bịa.
     */
    categories: z
      .array(
        z.object({
          /** 0–10; quyết định màu ô điểm (>=9 xanh, >=7 vàng, còn lại xám) */
          score: z.number(),
          description: z.string(),
        }),
      )
      .length(4)
      .optional(),

    /** Đoạn tóm tắt trong drawer "Summary" — CHỈ hiện dưới 768px */
    summary: z.string(),
  }),
});

/**
 * Trang nội dung phẳng: about, terms, privacy, advertiser disclosure.
 *
 * id file = slug URL, không khai `slug` trong frontmatter. Route sinh ở
 * `src/pages/[page].astro`.
 */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    /** Thẻ <title>. BỐN chuỗi này lệch quy luật của nhau ở bản gốc (trang
        privacy đảo vế, trang about thiếu chữ "10" và dùng nhãn khác hero) nên
        KHÔNG sinh máy được từ `heroTitle` — phải là dữ liệu. */
    title: z.string(),
    /** Nhãn ở banner đầu trang, đồng thời là mốc cuối của breadcrumb */
    heroTitle: z.string(),
    /** Chỉ khai khi bản mobile khác desktop. Render bằng set:html nên chèn được <br>. */
    heroMobileTitle: z.string().optional(),
    /**
     * Meta description. BẮT BUỘC — để `optional` thì cả bốn trang cùng rơi về
     * `SITE.defaultDescription`, tức bốn trang ship chung một mô tả. Mô tả mặc định
     * chỉ nên phục vụ trang chưa có mô hình nội dung, không phải trang đã có.
     */
    description: z.string(),
    /**
     * Tiêu đề mục trông thế nào.
     *
     * Bản gốc dựng bốn trang này từ HAI template CMS khác nhau: ba trang có tiêu
     * đề mục nổi bật (15px/700), riêng `terms-of-use` để tiêu đề mục cùng cỡ và
     * cùng độ đậm với thân bài, chỉ phân biệt bằng CHỮ IN HOA. Giữ khác biệt đó
     * thay vì ép về một kiểu — ép sẽ làm trang terms dài thêm khoảng 130px.
     */
    headingStyle: z.enum(["plain", "distinct"]).default("distinct"),
  }),
});

/**
 * MỘT FILE = MỘT TRANG TOPLIST. Trang chủ là entry `home` (id đó cho ra URL "/");
 * mọi ngách khác lấy id làm slug ở gốc site (`ecommerce-builders.mdx` -> "/ecommerce-builders/").
 *
 * Gom các collection cũ (`featuredArticles` + tiêu đề hero vốn viết cứng trong
 * `HeroToplist.astro`) về đây. Chúng đều có ĐÚNG MỘT entry tên `homepage` — tức là
 * đã sẵn hình dạng "khoá theo trang", chỉ là mới có một trang. Gộp lại thì thêm một
 * ngách là thêm một file, không phải bốn.
 *
 * `faq` và `miniReview` từng nằm ở đây; trang chủ hiện KHÔNG còn hai khối đó nên
 * trường cũng đi theo. `FaqAccordion.astro` / `MiniReview.astro` vẫn còn trong repo:
 * bật lại là thêm trường vào schema rồi render, không phải viết lại component.
 *
 * Bảng xếp hạng thì KHÔNG gộp: nó dài ~130 dòng cho 10 brand x 12 trường, và nhịp
 * sửa khác hẳn phần còn lại (điểm/coupon/thứ tự đổi hàng tuần, bài viết hàng quý).
 * Nối bằng `reference()` nên gõ sai id là lỗi build, không phải bảng trống.
 *
 * `.mdx` chứ không phải `.md`: thân bài nhúng `<InlineCta />`, là widget
 * (logo + nút + link affiliate) chứ không phải văn bản — tầng 3 của thang
 * Markdown → HTML → component ở CLAUDE.md workspace mục 4.
 */
/**
 * Nhãn và chữ nghĩa dùng CHUNG mọi trang. Mỗi file đúng MỘT entry.
 *
 * Khác `toplists/`: ở đó là chữ RIÊNG của từng ngách (tiêu đề banner, tiêu đề mục
 * "Best Overall ..."). Ở đây là thứ giống hệt ở mọi trang, nên component tự `getEntry`
 * thay vì nhận props — xâu qua props chỉ tạo prop drilling cho thứ không bao giờ khác.
 */
/**
 * Một KHỐI nội dung của site: đúng MỘT entry, id là tên file.
 *
 * Nhận cả `schema` trực tiếp lẫn dạng hàm `({ image }) => …` — dạng hàm cần cho khối
 * nào có ảnh (`contact.yaml`), vì `image()` chỉ tồn tại trong ngữ cảnh schema.
 */
const blocks = <T extends ZodType>(file: string, schema: T | ((ctx: SchemaContext) => T)) =>
  defineCollection({
    loader: glob({ pattern: file, base: "./src/content/blocks" }),
    schema,
  });

const labels = blocks(
  "labels.yaml",
  z.object({
    cta: z.object({
      visitSite: z.string(),
      viewRates: z.string(),
      readMore: z.string(),
      readMoreLower: z.string(),
      readReview: z.string(),
      compareAll: z.string(),
    }),
    heading: z.object({
      mustReads: z.string(),
      recommendedPartners: z.string(),
      summaryDrawer: z.string(),
    }),
    badge: z.object({
      lastUpdated: z.string(),
      advertisingDisclosure: z.string(),
    }),
    skipLink: z.string(),
  }),
);

const curatedPosts = blocks(
  "curated-posts.yaml",
  z.object({
    mustReads: z.array(reference("posts")),
    reviewSidebar: z.array(reference("posts")),
  }),
);

const notFound = blocks(
  "not-found.yaml",
  z.object({
    body: z.string(),
    links: z.object({ home: z.string(), reviews: z.string(), knowledge: z.string() }),
  }),
);

/**
 * Bốn hạng mục chấm điểm của khối "Review Highlights" — TÊN và ICON, dùng chung
 * mọi trang.
 *
 * Tách khỏi `reviews/*.mdx` vì bốn cái tên này không đổi theo brand: để trong từng
 * bài review là chép "Design/Features/Pricing/Usability" 14 lần, và sửa tên hạng
 * mục thành 14 lần sửa. Brand chỉ đóng góp ĐIỂM và MÔ TẢ.
 *
 * Dùng dạng hàm `({ image })` vì có `image()`.
 */
const reviewCategories = blocks("review-categories.yaml", ({ image }) =>
  z.object({
    entries: z.array(z.object({ title: z.string(), icon: image() })).length(4),
  }),
);

const toplists = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/toplists" }),
  schema: z.object({
    /** Thẻ <title> và meta description — riêng từng ngách, không dùng chung */
    title: z.string(),
    description: z.string(),

    /** <h1>. Chứa HTML thô nên render bằng set:html — `<span>` là từ chỉ hiện
        từ 768px, không tách được thành hai <h1> vì mỗi trang chỉ một <h1>. */
    heroTitle: z.string(),
    heroAlt: z.string(),
    /** Hai phụ đề cho hai mốc màn hình. Trang chủ hiện dùng CÙNG một câu ở cả
        hai — vẫn giữ hai trường vì ngách sau có thể cần câu ngắn riêng. */
    heroSubtitle: z.string(),
    heroSubtitleCompact: z.string(),

    ranking: reference("toplistPlacements"),

    /** Tieu de muc lap lai card hang 1 o cuoi danh sach. RIENG tung ngach. */
    bestOverallTitle: z.string(),

    /** Tiêu đề khối "Review Highlights". RIÊNG từng ngách vì nó gọi tên ngách
        ("Website Builders Review Highlights"), khác bốn tên hạng mục vốn toàn site. */
    miniReviewTitle: z.string(),

    /** Banner khuyến mãi ngang, chèn ngay SAU card hạng `afterRank`. Không khai
        thì danh sách chạy liền, không chèn gì. */
    promo: z
      .object({
        brand: reference("brands"),
        afterRank: z.number(),
        logoAlt: z.string(),
        title: z.string(),
        buttonText: z.string(),
      })
      .optional(),

    /** Tiêu đề khối bài viết. Thân bài KHÔNG lặp lại nó. */
    articleTitle: z.string(),
  }),
});

/** Bài blog. Thân MDX = prose + ảnh; TOC lấy từ heading trong thân.

    Gộp về đây dữ liệu vốn nằm rải ở SÁU nơi: frontmatter, knowledge.ts,
    mustReads.ts, reviewPage.sidebarArticles, ARTICLE_MAP hardcode trong
    PostSidebar.astro, và các chuỗi alt sinh theo 5 quy ước khác nhau. */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Tiêu đề hero bản MOBILE — bản gốc chèn <br> CỨNG để ngắt 2 dòng cân đối.
          Không đặt thì dùng `title`. HTML thô → render bằng set:html. */
      heroMobileTitle: z.string().optional(),
      /** Ngày thật để sắp xếp và để JSON-LD phát `datePublished`. Hiển thị đi
       *  qua `formatArticleDate` - xem `lib/article-date.ts`. */
      date: z.coerce.date(),
      readTime: z.string(),
      author: reference("authors"),
      /** Trích đoạn ~115 ký tự + "..." cho lưới /knowledge/. Điểm cắt là tuỳ ý
          của bản gốc — giữ nguyên văn, KHÔNG sinh lại bằng máy. */
      excerpt: z.string(),
      /** Trích đoạn dài hơn (1–2 câu đủ) cho sidebar "Must Reads" */
      excerptLong: z.string().optional(),
      /** BỐN ảnh KHÁC NHAU cho cùng một bài ở bốn vị trí — chính là lý do dữ
          liệu bị tách ra nhiều nơi trong bản cũ. Lưu ý `reviewSidebar` của bài
          "a-detailed-look…" trỏ ảnh must-reads-fresh-food.jpg: tréo tên nhưng
          là quirk CỐ Ý của bản gốc. */
      images: z.object({
        /** Lưới /knowledge/ */
        card: image(),
        /** Sidebar "Must Reads" trang chủ */
        mustRead: image().optional(),
        /** Sidebar trang review */
        reviewSidebar: image().optional(),
        /** Sidebar bài viết */
        blogSidebar: image().optional(),
      }),
      /** 2 bài gợi ý ở sidebar. Bài nào TỰ là must-read thì trỏ bài khác để
          không tự trỏ về chính nó. reference() nên gõ sai = lỗi build. */
      relatedPosts: z.array(reference("posts")),
    }),
});

/** Thẻ liên hệ trang /contact/. Tách riêng khỏi mini-reviews: gộp chung một
    collection thì mọi trường phải optional và mất sạch tác dụng validate. */
const contact = blocks("contact.yaml", ({ image }) =>
  z.object({
    cards: z.array(
      z.object({
        image: image(),
        title: z.string(),
        subtitle: z.string(),
        button: z.string(),
      }),
    ),
    /** Nhãn hộp thoại. Một chuỗi cho cả `<label>` lẫn `placeholder`. */
    modal: z.object({
      fallbackTitle: z.string(),
      fields: z.object({
        name: z.string(),
        company: z.string(),
        email: z.string(),
        message: z.string(),
      }),
      closeLabel: z.string(),
    }),
  }),
);

export const collections = {
  brands,
  toplistPlacements,
  reviewsPagePlacements,
  sidebarPlacements,
  headerNavPlacements,
  authors,
  reviews,
  labels,
  notFound,
  curatedPosts,
  reviewCategories,
  toplists,
  pages,
  posts,
  contact,
};
