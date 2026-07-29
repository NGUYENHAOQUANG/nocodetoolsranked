# top10dogfood.com

Trang toplist / review affiliate về dịch vụ giao thức ăn tươi cho chó.
Astro 7, static site, không dùng UI framework nào.

Doanh thu đến từ affiliate — các nút "Visit Site" / "View Rates" trỏ tới đối tác.
Vì vậy **link affiliate, thứ hạng, điểm số và ưu đãi là tài sản cốt lõi**, và
toàn bộ đều nằm trong file nội dung chứ không nằm trong code.

## Chạy

```sh
npm install
npm run dev        # http://localhost:4321
```

| Lệnh | Việc |
|---|---|
| `npm run dev` | Máy chủ phát triển |
| `npm run build` | Dựng site tĩnh vào `dist/` |
| `npm run preview` | Xem thử bản đã dựng |
| `npm run check` | Kiểm kiểu (`astro check`) — phải luôn 0 lỗi |
| `npm run format` | Format `.ts`/`.yaml`/`.json`. **Cố ý KHÔNG đụng `.astro`/`.mdx`** — xem CLAUDE.md §8.7 |

Cần Node ≥ 22.12.

## Việc thường ngày

Mục tiêu của dự án: **thêm/sửa nội dung không cần sửa code.** Cụ thể:

### Đổi link affiliate

`src/content/brands/<brand>.yaml` → trường `affiliateUrl`. **Một dòng, một file.**
Mọi nơi hiển thị link đó — toplist, card, sidebar, carousel, nút trong bài
review — đều lấy từ đây.

### Đổi thứ hạng hoặc điểm số

Bảng xếp hạng nằm ở `src/content/placements/`:

| File | Dùng cho |
|---|---|
| `homepage.yaml` | Toplist trang chủ (9 brand) |
| `reviews-page.yaml` | Danh sách `/reviews/` (6 brand) |
| `review-sidebar.yaml` | Thứ tự partner ở sidebar bài review |

Sửa `rank` / `rating` / `stars` / `coupon` ngay trong file tương ứng.

> Trang chủ và `/reviews/` **cố ý** có thứ tự và điểm khác nhau (Ollie 8.7 ở
> trang chủ, 9.3 ở `/reviews/`). Đó là hai bảng xếp hạng độc lập, không phải
> dữ liệu lệch — đừng "đồng bộ" chúng.

### Thêm một brand

1. Logo vào `src/assets/brands/<brand>.svg`
2. Tạo `src/content/brands/<brand>.yaml` — tên, logo, alt, link affiliate
3. Thêm một mục vào `src/content/placements/homepage.yaml`

Muốn brand đó có trang review riêng thì thêm bước 4–5:

4. Tạo `src/content/reviews/<brand>.mdx` (URL sẽ là `/reviews/<brand>/`)
5. Thêm brand vào `placements/reviews-page.yaml` và `placements/review-sidebar.yaml`

### Thêm một bài viết

Tạo **đúng một file** `src/content/posts/<slug>.mdx`. URL tự thành
`/knowledge/<slug>/`, và bài tự xuất hiện ở lưới `/knowledge/`.

Frontmatter cần: `title`, `date`, `readTime`, `author`, `excerpt`, `images.card`,
`relatedPosts`. Ảnh để trong `src/assets/images/posts/`.

> `images` có tới **bốn** slot vì cùng một bài dùng bốn ảnh khác nhau ở bốn vị
> trí (lưới knowledge, Must Reads trang chủ, sidebar review, sidebar bài viết).
> Chỉ `card` là bắt buộc.

### Sửa FAQ, thẻ liên hệ, đánh giá chi tiết

`src/content/faq/`, `src/content/contact-cards/`, `src/content/mini-reviews/`.

### Gõ sai thì sao?

Schema Zod validate lúc build. Gõ sai tên brand, tác giả hay bài viết là **lỗi
build**, không phải trang hỏng âm thầm.

## Cấu trúc

```
src/
├─ assets/        ảnh qua astro:assets
│  ├─ brands/     logo đối tác        ├─ authors/   ảnh tác giả
│  ├─ site/       logo của site       ├─ icons/
│  └─ images/{hero,posts,promos,contact}/
│
├─ content/       ← NỘI DUNG Ở ĐÂY
│  ├─ brands/     danh tính đối tác (logo, tên, link affiliate)
│  ├─ placements/ brand được xếp hạng thế nào ở từng trang
│  ├─ reviews/    bài review (.mdx)   ├─ posts/    bài viết (.mdx)
│  ├─ authors/    ├─ faq/  ├─ contact-cards/  ├─ mini-reviews/
│  └─ articles/   bài viết nhúng ở trang chủ
│
├─ components/
│  ├─ layout/     Header, Footer, Breadcrumbs, ToTop, ExitPopup, Seo
│  ├─ sections/   Hero, Toplist, BestOverall, MiniReview, ContentGrid…
│  ├─ brand/      PartnerCard, ReviewCard, ProsCons
│  ├─ article/    FeaturedArticle, InnerNavigator, PostIntro, ReviewIntro…
│  ├─ sidebar/    PostSidebar, ReviewSidebar, MustReads
│  └─ ui/         ScoreRing, Coupon, Paragraph, PartnerTooltip
│
├─ layouts/       BaseLayout (html+head+SEO), PostLayout
├─ pages/         route — xem bản đồ URL dưới
├─ lib/           links (nguồn duy nhất dựng URL), rankings, posts,
│                 schema-org, stars
├─ config/site.ts tên site, mô tả mặc định
└─ styles/        tokens.css · global.css · prose.css
```

Ý tưởng cốt lõi: **tách "brand là ai" khỏi "brand được xếp hạng thế nào ở trang
nào"**. `brands/` giữ danh tính (bất biến), `placements/` giữ thứ hạng (đổi theo
trang). Nhờ vậy đổi link affiliate là sửa một chỗ, mà hai trang vẫn xếp hạng
khác nhau được.

## URL

```
/                                    /reviews/            /knowledge/
/reviews/<brand>/                    /knowledge/<slug>/
/about/   /contact/   /privacy-policy/   /terms-of-use/   /advertiser-disclosure/
```

Route sinh từ tên file trong `content/reviews/` và `content/posts/`.
Mọi URL nội bộ dựng qua `src/lib/links.ts` — đừng gõ tay đường dẫn ở nơi khác.

> ⚠️ **URL đã đóng băng.** Đổi URL là mất thứ hạng tìm kiếm và phải kèm 301 ở
> tầng host. Xem CLAUDE.md §7.

## Trước khi sửa giao diện

Dự án tái tạo pixel-perfect một site có sẵn, nên **nhiều chỗ trông như lỗi lại là
cố ý** — dấu cách đôi trong `alt`, `<p>&nbsp;</p>` làm spacer, font khai báo mà
không nạp, trang Terms dùng `<p>` in hoa thay cho heading.

**Đọc `CLAUDE.md` trước khi đụng vào CSS hoặc markup.** Ở đó liệt kê đủ những chỗ
đó cùng lý do, và cách kiểm chứng thay đổi không làm lệch giao diện.

## Tài liệu

Astro: https://docs.astro.build
