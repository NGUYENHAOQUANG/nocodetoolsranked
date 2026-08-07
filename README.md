# nocodetoolsranked.com

Trang toplist / review affiliate về website builder (công cụ dựng web không cần code).
Astro 7, static, không dùng UI framework nào.

Doanh thu đến từ affiliate — nút "Visit Site" / "View Rates" trỏ sang đối tác.
Vì vậy **link affiliate, thứ hạng, điểm số và ưu đãi là tài sản cốt lõi**, và
toàn bộ nằm trong file nội dung chứ không nằm trong code.

> Tài liệu này dành cho người **vận hành nội dung**. Ai sửa code thì đọc
> [`CLAUDE.md`](./CLAUDE.md) — kiến trúc, quy ước, và những chỗ hành xử khác
> trực giác.

---

## Chạy

```sh
npm install
npm run dev        # http://localhost:4321
```

Cần Node >= 22.12.

| Lệnh              | Việc                                                     |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Máy chủ phát triển                                       |
| `npm run build`   | `check` -> dựng vào `dist/` -> `check-html` (14 luật)    |
| `npm run preview` | Xem thử bản đã dựng                                      |
| `npm run check`   | `astro check` (kiểu) + `check-content` (ASCII, URL trần) |
| `npm run format`  | Prettier cho mọi thứ **trừ** `src/content/**`            |

`npm run build` là cửa kiểm đầy đủ: hỏng ở bất kỳ bước nào là build dừng. Đừng
deploy bản chưa qua lệnh này.

---

## Việc thường ngày

Mục tiêu của dự án: **thêm/sửa nội dung không cần chạm vào code.**

### Đổi link affiliate

`src/content/brands/<brand>.yaml` -> trường `affiliateUrl`. **Một dòng, một file.**

Mọi nơi hiển thị link đó — toplist, card, sidebar, carousel, nút trong bài
review, CTA giữa bài — đều lấy từ đây.

> **Hiện MỌI brand đang để `affiliateUrl: "#"`.** Đó là chỗ giữ chỗ, không phải
> link thật: chưa thay thì mọi nút CTA trên site bấm vào không đi đâu cả.

### Đổi thứ hạng, điểm số, coupon

| File                                       | Dùng cho                                 |
| ------------------------------------------ | ---------------------------------------- |
| `src/content/placements/toplist/<id>.yaml` | Bảng xếp hạng của MỘT trang toplist      |
| `src/content/placements/reviews-page.yaml` | Danh sách `/reviews/` (9 brand)          |
| `src/content/placements/sidebar.yaml`      | Thứ tự partner ở sidebar (review + blog) |
| `src/content/placements/header-nav.yaml`   | Menu con "Reviews" trên thanh điều hướng |

`toplist/` có **một file mỗi ngách**; `home.yaml` là trang chủ.

Sửa `rank` / `rating` / `badge` / `coupon` ngay trong file tương ứng.

> Trang chủ và `/reviews/` **cố ý** khác nhau: trang chủ xếp 8 brand, `/reviews/`
> liệt kê 9 brand khác một phần và theo thứ tự khác. Đó là hai bảng độc lập, không
> phải dữ liệu lệch — đừng "đồng bộ" chúng.

> `stars` và `reviewsCount` là **tuỳ chọn**: không khai thì card chỉ hiện vòng điểm
> và nhãn. Chỉ khai khi có số THẬT — điền bừa là bịa số liệu xã hội trên một trang
> kiếm tiền.

### Thêm một brand

1. Logo vào `src/assets/brands/<brand>.svg`
2. Tạo `src/content/brands/<brand>.yaml` — tên, logo, alt, `affiliateUrl`
3. Thêm một mục vào `src/content/placements/toplist/<ngách>.yaml`

Muốn brand đó có trang review riêng thì thêm:

4. `src/content/reviews/<brand>.mdx` -> URL thành `/reviews/<brand>/`
5. Thêm brand vào `placements/reviews-page.yaml`, và vào `placements/sidebar.yaml`
   / `placements/header-nav.yaml` nếu muốn nó xuất hiện ở sidebar / menu

> Tên file review **phải trùng id brand** — URL `/reviews/<brand>/` dựng thẳng từ
> khoá brand, nên đặt khác tên là link sidebar và menu trỏ vào trang 404.

### Thêm một trang toplist (ngách mới)

**Hai file, không sửa dòng code nào.**

1. `src/content/toplists/<slug>.mdx` -> URL thành `/<slug>/`

   Frontmatter bắt buộc: `title`, `description`, `heroTitle`, `heroAlt`,
   `heroSubtitle`, `heroSubtitleCompact`, `ranking`, `bestOverallTitle`,
   `miniReviewTitle`, `articleTitle`. `promo` (banner ngang chèn giữa danh sách) là
   tuỳ chọn.

   Thân MDX chính là bài viết dài nằm dưới bảng xếp hạng.

2. `src/content/placements/toplist/<slug>.yaml` — thứ hạng riêng của ngách đó

Trang chủ chính là entry `toplists/home.mdx`; id `home` cho ra URL `/`. Nó dùng
CHUNG khuôn với mọi ngách — không có `index.astro` riêng.

> **Id bị chiếm:** `home` dành cho trang chủ. Ngoài ra id ngách không được trùng
> id trong `content/pages/` (`terms-of-use`, `privacy-policy`,
> `advertiser-disclosure`) và không được là `contact`, `reviews`, `knowledge`.

### Thêm một bài viết

Tạo **đúng một file** `src/content/posts/<slug>.mdx`. URL tự thành
`/knowledge/<slug>/`, và bài tự xuất hiện ở lưới `/knowledge/` — lưới lấy MỌI bài
trong collection và sắp theo `date` giảm dần, không có danh sách khai tay nào.

Muốn bài đó xuất hiện thêm ở "Must Reads" (trang chủ) hoặc sidebar trang review
thì thêm slug vào `src/content/blocks/curated-posts.yaml`. Hai chỗ đó là **tuyển
chọn** (thứ tự không theo ngày) nên phải khai tay.

Frontmatter bắt buộc: `title`, `date` (dạng ISO `2026-01-06`), `readTime`, `author`, `excerpt`,
`images.card`, `relatedPosts`. Ảnh để trong `src/assets/posts/`.

> `images` có tới **bốn** slot vì cùng một bài có thể dùng bốn ảnh khác nhau ở bốn
> vị trí (lưới knowledge, Must Reads trang chủ, sidebar review, sidebar bài viết).
> Chỉ `card` bắt buộc. Ba bài hiện tại dùng chung một ảnh cho cả bốn slot.

### Sửa thẻ liên hệ, chữ nút, chữ trang 404

Nội dung trang liên hệ ở `src/content/blocks/contact.yaml`; chữ nút CTA và nhãn
banner ở `blocks/labels.yaml`; chữ trang 404 ở `blocks/not-found.yaml`.

Khối **"Review Highlights"** (ba brand đầu bảng, chấm điểm 4 hạng mục) lấy nội dung
từ ba chỗ:

| Sửa cái gì                          | Ở đâu                                            |
| ----------------------------------- | ------------------------------------------------ |
| Tiêu đề khối                        | `toplists/<slug>.mdx` -> `miniReviewTitle`       |
| Tên + icon 4 hạng mục               | `blocks/review-categories.yaml` (toàn site)      |
| Điểm + mô tả từng hạng mục, tóm tắt | `reviews/<brand>.mdx` -> `categories`, `summary` |

Bốn hạng mục hiện tại: **Build · Control · Tools · Reliability**.

> Thứ tự `categories` trong bài review phải khớp thứ tự trong
> `review-categories.yaml` — ghép theo VỊ TRÍ, không theo tên. Đổi thứ tự một bên mà
> quên bên kia là điểm gắn nhầm hạng mục, build vẫn xanh.

> `categories` là **tuỳ chọn**. Brand chưa có bản chấm điểm (hiện là `tide`,
> `ionos`, `square-online`) thì khối này BỎ QUA nó và lấy brand kế tiếp — thà vắng
> còn hơn dựng bốn ô rỗng hay mượn tạm mô tả của bộ hạng mục khác.

> Trang chủ hiện **không có** khối FAQ. Component `FaqAccordion` vẫn nằm trong
> `src/components/toplist/` — bật lại là việc của người sửa code, xem `CLAUDE.md`.

### Đổi ảnh chia sẻ mạng xã hội

**Ghi đè `public/og-image.jpg`**, giữ nguyên tên và kích thước **1200x630**.
Không cần sửa code.

Ảnh đang dùng là ảnh **tạm**, dựng từ banner hero đặt trên nền `#f0f7fc`.

> Phải để ở `public/` chứ không phải `src/assets/`: Astro băm tên file trong
> `src/assets/` nên đổi ảnh là đổi URL, mà mạng xã hội **cache URL đó** — link
> đã chia sẻ sẽ mất ảnh.

### Viết nội dung: hai luật bắt buộc

Cả hai được kiểm tự động, sai là build dừng.

**Chỉ dùng ký tự ASCII.** Không nháy cong, em dash, ellipsis. Chúng lọt vào khi
dán từ Word / Google Docs / ChatGPT, và là ký tự **nhìn không ra**. Gõ `'`, `-`,
`...`. Ngoại lệ: `©` `®` `™`, và tên riêng viết đúng chính tả của nó.

**URL trần phải được bọc.** Viết URL trần trong bài thì Markdown **tự biến nó
thành link ra ngoài** — trên site affiliate đó là rò traffic mà không có gì báo.
Muốn giữ dạng chữ: `{'https://...'}`. Muốn thành link: `[chữ](https://...)`.

### Gõ sai thì sao?

Schema Zod validate lúc build. Gõ sai tên brand, tác giả hay bài viết là **lỗi
build**, không phải trang hỏng âm thầm.

---

## Cấu trúc

```
src/
├─ content/       <- NỘI DUNG Ở ĐÂY
│  ├─ brands/       15  danh tính đối tác (tên, logo, alt, link affiliate)
│  ├─ toplists/      1  MỘT FILE = MỘT TRANG TOPLIST (home.mdx là trang chủ)
│  ├─ placements/    4  brand được xếp hạng thế nào ở từng trang
│  │                    └─ toplist/  một file mỗi ngách
│  ├─ reviews/      14  bài review từng brand (.mdx)
│  ├─ posts/         3  bài blog (.mdx)
│  ├─ pages/         3  trang phẳng: terms, privacy, disclosure
│  ├─ authors/       2
│  └─ blocks/        5  MỘT FILE = MỘT KHỐI nội dung, mỗi file đúng MỘT entry
│                       labels · not-found · curated-posts · contact
│                       review-categories
│
├─ assets/        file nhị phân Astro băm và phát ra
│                 brands · authors · heroes · posts · promos · illustrations · icons · site · fonts
│
├─ components/    thư mục = LOẠI TRANG mà component phục vụ
│  ├─ layout/     6  mọi trang: Header, Footer, Breadcrumbs, HeroInner, Seo, ToTop
│  ├─ toplist/   16  trang chủ + mọi ngách
│  ├─ article/   12  trang review + bài blog
│  ├─ review/     2  ReviewsList, ReviewCard
│  ├─ knowledge/  1  KnowledgeGrid
│  └─ contact/    1  ContactCards
│
├─ layouts/       BaseLayout (html/head/SEO) · InnerPageLayout (khung trang trong)
├─ pages/         route — xem bảng dưới
├─ lib/           links · rankings · posts · article-date · schema-org · stars · icon-paths
├─ config/        site.ts — tên site, mô tả + ảnh chia sẻ mặc định
└─ styles/        tokens · global · prose · hero

public/           thứ cần GIỮ NGUYÊN đường dẫn (Astro KHÔNG băm tên)
                  favicon.svg · robots.txt · og-image.jpg
scripts/          check-content.mjs · check-html.mjs
```

Hai ý tưởng chi phối toàn bộ:

**Nội dung** — tách _"brand LÀ AI"_ khỏi _"brand XUẤT HIỆN THẾ NÀO ở từng
trang"_. `brands/` giữ danh tính (bất biến), `placements/` giữ thứ hạng (đổi
theo trang). Nhờ vậy đổi link affiliate là sửa một chỗ, mà mỗi trang vẫn xếp
hạng khác nhau được.

**Component** — thư mục là **loại trang phục vụ nó**. Chỉ một loại trang dùng
thì nằm ở thư mục trang đó; nhiều loại trang dùng thì lên tầng chung gần nhất
(`article/` cho review + blog, `layout/` cho gần như mọi trang).

---

## URL

Mọi route sinh từ tên file trong content collection — thêm file là thêm trang.

| URL                  | Sinh từ                  | Route                          |
| -------------------- | ------------------------ | ------------------------------ |
| `/` và `/<ngách>/`   | `content/toplists/*.mdx` | `pages/[...toplist].astro`     |
| `/reviews/<brand>/`  | `content/reviews/*.mdx`  | `pages/reviews/[slug].astro`   |
| `/knowledge/<slug>/` | `content/posts/*.mdx`    | `pages/knowledge/[slug].astro` |
| 3 trang phẳng        | `content/pages/*.mdx`    | `pages/[page].astro`           |

Ngoài ra `/reviews/`, `/knowledge/`, `/contact/` là page tĩnh, và `/404`.

Slug **chính là tên file**, không khai `slug` trong frontmatter. Mọi URL kết
thúc bằng `/`.

Mọi URL nội bộ dựng qua **`src/lib/links.ts`** — đổi cấu trúc URL thì sửa một
chỗ đó, đừng gõ tay đường dẫn trong component.

> Site đã chạy thật và được index thì đổi URL phải kèm 301 ở tầng host, nếu
> không sẽ mất thứ hạng tìm kiếm đã có.

---

## Ghi chú

Nội dung nhập từ một site có sẵn cùng nền tảng. Dấu vết của nguồn **đã dọn xong** —
dấu cách thừa trong `alt`, `<p>&nbsp;</p>` làm spacer, nháy cong và em dash.
`CLAUDE.md` mục _"Nội dung đến từ nguồn ngoài"_ ghi lại từng thứ, vì sao không
còn, và vài chỗ **cố ý giữ**.

**Ba thứ còn là chỗ giữ chỗ, phải thay trước khi chạy thật:**

1. `affiliateUrl` của cả 15 brand đang là `"#"`.
2. `src/assets/site/logo.svg` và `logo-white.svg` mang **tên thương hiệu của site
   nguồn**, không phải của site này.
3. `public/og-image.jpg` dựng máy móc từ banner, chưa có thiết kế riêng.

Astro: https://docs.astro.build
