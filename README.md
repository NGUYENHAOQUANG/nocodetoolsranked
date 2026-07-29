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

| Lệnh              | Việc                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| `npm run dev`     | Máy chủ phát triển                                                        |
| `npm run build`   | Chạy `check` rồi dựng site tĩnh vào `dist/`                               |
| `npm run preview` | Xem thử bản đã dựng                                                       |
| `npm run check`   | `astro check` (kiểu) + `check-content.mjs` (ASCII, URL trần) — luôn 0 lỗi |
| `npm run format`  | Format mọi thứ trừ `src/content/**` (nội dung chỉnh tay) — xem CLAUDE.md  |

Cần Node ≥ 22.12.

## Việc thường ngày

Mục tiêu của dự án: **thêm/sửa nội dung không cần sửa code.** Cụ thể:

### Đổi link affiliate

`src/content/brands/<brand>.yaml` → trường `affiliateUrl`. **Một dòng, một file.**
Mọi nơi hiển thị link đó — toplist, card, sidebar, carousel, nút trong bài
review — đều lấy từ đây.

### Đổi thứ hạng hoặc điểm số

Bảng xếp hạng nằm ở `src/content/placements/`:

| File                  | Dùng cho                            |
| --------------------- | ----------------------------------- |
| `toplist/<id>.yaml`   | Toplist của một trang toplist       |
| `reviews-page.yaml`   | Danh sách `/reviews/` (6 brand)     |
| `review-sidebar.yaml` | Thứ tự partner ở sidebar bài review |

`toplist/` có MỘT FILE MỖI NGÁCH — `home.yaml` là trang chủ.

Sửa `rank` / `rating` / `stars` / `coupon` ngay trong file tương ứng.

> Trang chủ và `/reviews/` **cố ý** có thứ tự và điểm khác nhau (Ollie 8.7 ở
> trang chủ, 9.3 ở `/reviews/`). Đó là hai bảng xếp hạng độc lập, không phải
> dữ liệu lệch — đừng "đồng bộ" chúng.

### Thêm một brand

1. Logo vào `src/assets/brands/<brand>.svg`
2. Tạo `src/content/brands/<brand>.yaml` — tên, logo, alt, link affiliate
3. Thêm một mục vào `src/content/placements/toplist/<ngách>.yaml`

Muốn brand đó có trang review riêng thì thêm bước 4–5:

4. Tạo `src/content/reviews/<brand>.mdx` (URL sẽ là `/reviews/<brand>/`)
5. Thêm brand vào `placements/reviews-page.yaml` và `placements/review-sidebar.yaml`

### Thêm một bài viết

Tạo **đúng một file** `src/content/posts/<slug>.mdx`. URL tự thành
`/knowledge/<slug>/`, và bài tự xuất hiện ở lưới `/knowledge/`.

Frontmatter cần: `title`, `date`, `readTime`, `author`, `excerpt`, `images.card`,
`relatedPosts`. Ảnh để trong `src/assets/posts/`.

> `images` có tới **bốn** slot vì cùng một bài dùng bốn ảnh khác nhau ở bốn vị
> trí (lưới knowledge, Must Reads trang chủ, sidebar review, sidebar bài viết).
> Chỉ `card` là bắt buộc.

### Thêm một trang toplist (ngách mới)

**Hai file, không sửa dòng code nào:**

1. `src/content/toplists/<slug>.mdx` — URL thành `/<slug>/`.
   Frontmatter: `title`, `description`, `heroTitle`, `heroAlt`, `heroSubtitle`,
   `heroSubtitleCompact`, `ranking`, `articleTitle`, `faq`, `miniReview`;
   `promo` là tuỳ chọn. Thân MDX là bài viết dài dưới bảng xếp hạng.
2. `src/content/placements/toplist/<slug>.yaml` — thứ hạng riêng của ngách đó.

Trang chủ chính là entry `toplists/home.mdx`; id `home` cho ra URL `/`. Nó dùng
CHUNG khuôn với mọi ngách, không có `index.astro` riêng.

> `home` là id dành riêng. Ngoài ra id ngách không được trùng id trong
> `content/pages/` (`about`, `terms-of-use`, `privacy-policy`,
> `advertiser-disclosure`) và không được là `contact`, `reviews`, `knowledge`.

### Sửa FAQ, đánh giá chi tiết, thẻ liên hệ

FAQ và mini-review nằm trong frontmatter của chính trang toplist
(`src/content/toplists/<slug>.mdx`). Thẻ liên hệ ở `src/content/contact-cards/`.

### Gõ sai thì sao?

Schema Zod validate lúc build. Gõ sai tên brand, tác giả hay bài viết là **lỗi
build**, không phải trang hỏng âm thầm.

## Cấu trúc

```
src/
├─ assets/        ảnh qua astro:assets
│  ├─ brands/     logo đối tác        ├─ authors/   ảnh tác giả
│  ├─ site/       logo của site       ├─ icons/
│  ├─ hero/ ├─ posts/ ├─ promos/ ├─ contact/
│
├─ content/       ← NỘI DUNG Ở ĐÂY
│  ├─ brands/     danh tính đối tác (logo, tên, link affiliate)
│  ├─ toplists/   MỘT FILE = MỘT TRANG TOPLIST (home.mdx là trang chủ)
│  ├─ placements/ brand được xếp hạng thế nào ở từng trang
│  │              └─ toplist/  một file mỗi ngách
│  ├─ reviews/    bài review (.mdx)   ├─ posts/    bài viết (.mdx)
│  ├─ authors/    ├─ contact-cards/
│  └─ pages/      4 trang nội dung phẳng: about, terms, privacy, disclosure
│
├─ components/    thư mục = LOẠI TRANG mà component phục vụ
│  ├─ layout/     mọi trang: Header, Footer, Breadcrumbs, ToTop, Seo, HeroInner
│  ├─ toplist/    trang chủ + mọi ngách: HeroToplist, PartnerList, PartnerCard,
│  │              ScoreRing, MiniReview, ContentGrid, FaqAccordion, ExitPopup…
│  ├─ article/    trang review + bài blog: ArticleGrid, InnerNavigator,
│  │              SidebarPartners, ReviewIntro, PostIntro, ProsCons…
│  ├─ reviews/    ReviewsList, ReviewCard      ├─ knowledge/ KnowledgeGrid
│  └─ contact/    ContactCards
│
├─ layouts/       BaseLayout (html+head+SEO), InnerPageLayout (khung trang
│                 trong). Chỉ hai file, đều có <slot/>
├─ pages/         route — xem bản đồ URL dưới
├─ lib/           links (nguồn duy nhất dựng URL), rankings, posts,
│                 schema-org, stars
├─ config/site.ts tên site, mô tả mặc định
├─ styles/        tokens.css · global.css · prose.css · hero.css
└─ ../scripts/    check-content.mjs (kiểm quy ước nội dung)
```

Component: **thư mục là loại trang phục vụ nó**. Chỉ một trang dùng thì nằm ở
thư mục trang đó; nhiều loại trang dùng thì lên tầng chung gần nhất (`article/`
cho review + blog, `layout/` cho gần như mọi trang).

Nội dung: **tách "brand là ai" khỏi "brand được xếp hạng thế nào ở trang
nào"**. `brands/` giữ danh tính (bất biến), `placements/` giữ thứ hạng (đổi theo
trang). Nhờ vậy đổi link affiliate là sửa một chỗ, mà hai trang vẫn xếp hạng
khác nhau được.

## URL

```
/  và  /<ngách>/   (content/toplists/)   /reviews/            /knowledge/
/reviews/<brand>/                    /knowledge/<slug>/
/about/   /contact/   /privacy-policy/   /terms-of-use/   /advertiser-disclosure/
```

Route sinh từ tên file trong `content/reviews/` và `content/posts/`.

Mọi URL nội bộ dựng qua **`src/lib/links.ts`** — đổi cấu trúc URL thì sửa một
chỗ đó, đừng gõ tay đường dẫn trong component.

> Nếu site đã chạy thật và được index, đổi URL cần kèm 301 ở tầng host, nếu
> không sẽ mất thứ hạng tìm kiếm đã có.

## Ghi chú

Nội dung ban đầu nhập từ một site có sẵn, nên vài chuỗi còn mang dấu vết của
nguồn (dấu cách thừa trong `alt`, `<p>&nbsp;</p>` làm spacer, trang Terms không
dùng heading). Sửa được nếu muốn chuẩn hoá — `CLAUDE.md` liệt kê đủ.

`CLAUDE.md` cũng ghi những chỗ hành xử khác trực giác (`rem` co theo breakpoint,
scoped style không xuyên component, tên file ảnh nằm trong URL). Đáng đọc trước
khi sửa CSS.

## Tài liệu

Astro: https://docs.astro.build
