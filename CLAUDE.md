# CLAUDE.md — Bản ghi mục đích dự án

> Viết **trước** khi bắt đầu tái cấu trúc. File này ghi lại *tại sao* và *được phép làm gì*,
> để mọi phiên làm việc sau (người hoặc AI) không đi chệch mục tiêu.

## 1. Dự án là gì

Trang **toplist / review affiliate** về dịch vụ giao thức ăn tươi cho chó
(top10dogfood), dựng bằng **Astro** (static site), toàn bộ mã nguồn nằm trong `web/`.

Mô hình kiếm tiền là affiliate: doanh thu đến từ các nút "Visit Site" / "View Rates"
trỏ tới đối tác. Vì vậy **link affiliate, thứ hạng, điểm số và ưu đãi là tài sản
cốt lõi của dự án** — chúng phải dễ sửa, dễ kiểm tra, khó sai.

Các nhóm trang hiện có:

| Nhóm | URL | Nguồn nội dung hiện tại |
|---|---|---|
| Trang chủ (toplist 9 brand) | `/` | `src/data/brands.ts` + `src/content/articles/` |
| Danh sách review | `/reviews/` | `src/data/reviews.ts` |
| Bài review từng brand | `/<brand>-review/` | `src/content/reviews/*.mdx` |
| Bài blog | `/<slug>/` | `src/content/blog/*.mdx` |
| Knowledge center | `/knowledge/` | `src/data/knowledge.ts` |
| Trang tĩnh (about, contact, privacy, terms, disclosure) | `/<slug>/` | viết thẳng trong `.astro` |

**Site chưa lên sóng, chưa được Google index.** Đây là lý do §8 được phép sắp xếp lại
toàn bộ URL — cửa sổ làm việc đó sẽ đóng lại ngay khi site chạy thật.

Domain chính thức: `https://top10dogfood.com`

## 2. Trạng thái hiện tại

Giao diện và nội dung **đã đúng** — trang đã bám sát bản gốc, kể cả những chi tiết
cố ý giữ nguyên (khoảng trắng thừa trong `alt`, `smartypants: false`, đoạn `&nbsp;`
rỗng của Ollie…). Các ghi chú kiểu đó nằm rải rác trong comment mã nguồn và **phải
được bảo toàn khi tái cấu trúc**.

Cái **chưa đúng** là kiến trúc bên dưới.

## 3. Mục đích của tôi (điều cần đạt được)

Tôi muốn **làm lại phần cấu trúc cho chuẩn Astro để dùng lâu dài**, cụ thể:

1. **Thêm/bớt/sửa nội dung không phải sửa code.** Thêm một brand vào toplist, thêm
   một bài blog, đổi một link affiliate — đều chỉ là thêm/sửa một file nội dung,
   có schema validate, báo lỗi lúc build nếu thiếu trường.
2. **Một nguồn sự thật cho mỗi thứ.** Không còn cùng một brand bị khai ở nhiều nơi
   với logo/alt/href lặp lại và có nguy cơ lệch nhau.
3. **Dùng content collection đúng cách** — đúng vai trò của nó (nội dung có cấu trúc,
   có schema, có quan hệ giữa các collection), chứ không phải chỉ để chứa MDX còn
   dữ liệu thật thì nằm trong mảng TypeScript.
4. **Routing chuẩn Astro** — route động sinh trang từ nội dung, không phải mỗi bài
   một thư mục boilerplate.
5. **Chia code rõ tầng** — layout / page / component / dữ liệu / tiện ích tách bạch,
   thư mục có thể tìm được thứ mình cần mà không phải đọc hết.
6. **Nền tảng SEO tử tế** — canonical, OG/Twitter, sitemap, robots, `site` URL, vì
   đây là site sống bằng traffic tìm kiếm.

## 4. Ràng buộc bất di bất dịch

**Giao diện phải giữ nguyên.** Đây là ràng buộc duy nhất không được thương lượng.
Sau khi tái cấu trúc, mọi trang phải render ra HTML/CSS cho kết quả thị giác giống
hệt hiện tại ở mọi breakpoint (đặc biệt các mốc `1025px` / `min-height: 420px` đang
dùng). Nội dung chữ nghĩa cũng giữ nguyên từng ký tự.

**Phát biểu theo nghĩa vận hành** — cần thiết vì "giống từng ký tự" không thể đúng
theo nghĩa đen: `scopedStyleStrategy` của Astro mặc định là `"attribute"`
(`node_modules/astro/dist/core/config/schemas/base.js:49`) và hash `data-astro-cid-*`
sinh ra **từ đường dẫn file component**. Dời component sang thư mục con (§8.6) tất yếu
đổi cid của mọi component, tức đổi thuộc tính của mọi element trong HTML phát ra.
Vậy tiêu chí nghiệm thu là:

> **Giống nhau sau khi chuẩn hoá** giá trị `data-astro-cid-*` và hash
> `/_astro/<tên>.<hash>.<ext>`, xét riêng trong `<body>`.
> **Mọi text node so từng byte, không tha** — dấu cách đôi trong `"Ollie  logo"`,
> dấu cách cuối trong `"Visit Site "`, `&nbsp;`, `’`, `—` đều phải sống sót.

Ba loại khác biệt được phép, ngoài ra không còn gì khác:
1. URL đổi theo §8.3
2. Breadcrumb bài viết: `Home > - > tiêu đề` → `Home > Knowledge > tiêu đề`
3. `<meta name="description">` mặc định: tiếng Việt → tiếng Anh (hiện cả 10 trang
   đều đang ship chuỗi tiếng Việt vì không trang nào override)

## 5. Quyền hạn khi sửa

Rất rộng — **không cần bám vào code đã có**:

- Được **viết lại từ đầu** bất kỳ file nào, kể cả toàn bộ `src/`.
- Được **đổi tên, gộp, tách, xóa** file, thư mục, biến, hàm, kiểu dữ liệu tùy ý
  (trừ tên URL — xem §7).
- Được **thay đổi schema, thay đổi hình dạng dữ liệu**, đổi cách tổ chức collection.
- Được **thêm dependency / integration** của Astro nếu nó làm cấu trúc chuẩn hơn.
- Được đổi cách viết CSS, miễn kết quả hiển thị không đổi.

Nói cách khác: **code hiện tại là bản tham chiếu về kết quả, không phải nền móng phải giữ.**
Cứ chọn cách chuẩn Astro nhất, rồi tái tạo lại đúng giao diện đó.

## 6. Những điểm tôi thấy chưa chuẩn

Ghi lại để lần sửa tới xử lý — không nhất thiết đúng hết, cứ đánh giá lại khi làm:

**Nội dung nằm sai chỗ**
- `src/data/*.ts` (`brands`, `reviews`, `faq`, `knowledge`, `mustReads`, `contactCards`)
  đang chứa **nội dung biên tập** dưới dạng mảng TypeScript. Đây đáng lẽ phải là
  content collection có schema. Hệ quả: sửa nội dung = sửa code, không validate được,
  không tận dụng được `image()` helper.

**Dữ liệu trùng lặp, nhiều nguồn sự thật**
- Cùng một tập brand đang được khai ở **4 nơi**: `brands.ts` (toplist trang chủ),
  `reviews.ts` (trang `/reviews/`), `reviewPage.ts` (`partnerLogos`, `carouselPartners`,
  `sidebarPartners`), và frontmatter của `content/reviews/*.mdx`. Logo, `alt`, `href`
  lặp lại ở cả 4 → sửa một link affiliate phải nhớ sửa mấy chỗ.
- Lưu ý: điểm số và thứ tự ở trang chủ **cố ý khác** trang `/reviews/` (Ollie 8.7 vs 9.3).
  Đây là chủ ý, không phải bug — mô hình dữ liệu mới phải diễn đạt được sự khác biệt
  này một cách tường minh thay vì bằng cách chép dữ liệu ra hai bản.

- Y hệt như vậy với **bài viết**: cùng 6 bài đang được khai ở **5 nơi** —
  frontmatter `content/blog/*.mdx`, `data/knowledge.ts` (lưới `/knowledge/`),
  `data/mustReads.ts` (sidebar trang chủ), `reviewPage.sidebarArticles` (sidebar trang
  review), và `ARTICLE_MAP` **hardcode thẳng trong** `BlogSidebar.astro`. Mỗi nơi một
  ảnh thumbnail khác nhau — đó là lý do chúng bị tách ra, nhưng tiêu đề và href thì
  lặp lại 5 lần.

**Liên kết bằng chuỗi ma thuật, không type-safe**
- `partner: "ollie"` trong frontmatter tra vào `Record<string, …>`; `sidebarArticles`
  tra `ARTICLE_MAP` nằm trong component; `avatar` tra `AVATARS` nằm trong layout.
  Sai chính tả → lỗi runtime hoặc `undefined` âm thầm. Astro có `reference()` để
  làm quan hệ giữa collection một cách có kiểm tra.

**Routing lộn ngược**
- Mỗi bài blog có một thư mục `src/pages/<slug>/index.astro` chỉ để gọi
  `<BlogPost slug="…" />` — 6 file boilerplate. Đáng lẽ một route động
  `[...slug].astro` + `getStaticPaths()`.
- `layouts/BlogPost.astro` tự đi `getEntry()` lấy dữ liệu. Layout không nên fetch
  dữ liệu — đó là việc của page. Chính chỗ này khiến phải đẻ ra các thư mục wrapper.
- `slug` được khai tay trong frontmatter review, song song với `id` của loader →
  hai nguồn sự thật cho URL.

**Tổ chức thư mục**
- `src/components/` phẳng, 30+ file, trộn lẫn khối bố cục (`Header`, `Footer`),
  khối section trang chủ (`Toplist`, `BestOverall`), và mảnh UI nhỏ (`ScoreRing`,
  `Coupon`, `ProsCons`). Không nhìn ra được cái nào dùng ở đâu.
- `src/assets/images/` phẳng, đặt tên theo tiền tố (`blog-…`, `must-reads-…`) thay vì
  theo thư mục. Ảnh đang phải `import` thủ công trong file data thay vì để cạnh
  nội dung và khai trong schema.
- Không có path alias (`@/components/…`), đang đi `../../` khắp nơi.

**SEO / hạ tầng**
- `astro.config.mjs` chưa khai `site` → không dựng được canonical, không có sitemap.
- `BaseLayout` chỉ có `<title>` + `description`; thiếu canonical, OG, Twitter card,
  JSON-LD. `description` mặc định đang là **tiếng Việt** trên một site tiếng Anh.
- Chưa có `@astrojs/sitemap`, chưa có `robots.txt`.
- `package.json` chưa có script `astro check` (typecheck) hay format.

**Affiliate**
- Toàn bộ `href` đang là `#`. Vì đây là site aff, cần **một nơi duy nhất** quản lý
  link/ưu đãi cho mỗi đối tác, để các trang tham chiếu tới thay vì tự khai.

## 7. Quy tắc đặt tên

Tên hiện tại đang lẫn lộn nhiều quy ước (`reviewPage.ts` camelCase cạnh `brands.ts`
thường, `mustReads.ts` cạnh `faq.ts`). **Được phép và nên đổi lại tên file/biến/hàm
cho thống nhất** trong lúc tái cấu trúc.

### Nguyên tắc chung

- Ưu tiên **tên đầy đủ, rõ nghĩa** hơn tên ngắn. Không viết tắt tự chế
  (`btn`, `img`, `desc`, `cfg`) trừ những từ đã phổ biến toàn ngành (`url`, `id`, `cta`).
- Tên nói **cái đó là gì**, không nói nó nằm ở đâu. `ReviewSidebar` chứ không phải
  `RightColumn`; `partnerOffers` chứ không phải `dataForCarousel`.
- Không nhét kiểu dữ liệu vào tên (`brandsArray`, `strTitle`).
- Không đặt tên theo trang đang dùng nó nếu thứ đó có thể dùng lại chỗ khác.

### File và thư mục

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component, layout (`.astro`) | **PascalCase**, tên file = tên component | `ReviewCard.astro`, `BaseLayout.astro` |
| Page (`.astro` trong `pages/`) | **kebab-case**, khớp URL | `advertiser-disclosure.astro` |
| Route động | kebab-case + tham số | `[...slug].astro`, `[brand].astro` |
| Module TS/JS (`lib/`, `config/`) | **kebab-case** | `format-rating.ts`, `site-config.ts` |
| File nội dung (collection) | **kebab-case**, chính là slug | `why-fresh-food-is-the-best-for-dogs.mdx` |
| Ảnh, asset | **kebab-case** | `author-steve-diller.png` |
| Thư mục | **kebab-case**, số nhiều nếu chứa nhiều thứ cùng loại | `components/`, `assets/logos/` |

Bỏ lối `pages/<slug>/index.astro` chỉ để tạo URL — dùng `pages/<slug>.astro` hoặc
route động. Chỉ giữ `index.astro` khi nó thật sự là trang chỉ mục của một thư mục.

Một file `.astro` xuất một component: **tên file phải trùng tên component**. Không
có file `utils.ts` / `helpers.ts` / `misc.ts` chung chung — đặt tên theo việc nó làm.

### Code

- **Biến, hàm, thuộc tính**: `camelCase` — `partnerLogo`, `getBrandBySlug()`.
- **Hàm** bắt đầu bằng động từ: `getX`, `formatX`, `buildX`, `resolveX`.
  Chỉ dùng `getX` khi thật sự truy xuất; tính toán thì `computeX` / `formatX`.
- **Boolean** có tiền tố `is` / `has` / `should` / `can`:
  `isEditorsChoice`, `hasMobileLogo`, `shouldShowTooltip`.
  (Hiện tại `editorsChoice`, `trailingBlank` đang thiếu tiền tố — đổi lại.)
- **Type, interface, class**: `PascalCase`, **không** tiền tố `I`/`T`.
  Interface props của component Astro luôn tên là `Props` (quy ước Astro).
- **Hằng số** thật sự bất biến ở cấp module: `UPPER_SNAKE_CASE` — `AVATARS`, `SITE_URL`.
  Dữ liệu export bình thường vẫn `camelCase`.
- Mảng và collection dùng **số nhiều** (`brands`), phần tử đơn dùng **số ít** (`brand`).
- Kiểu của phần tử là số ít của collection: `brands: Brand[]`, `reviews: Review[]`.

### Content collection

- Tên collection: **số nhiều, thường, một từ nếu được** — `brands`, `reviews`, `posts`.
- Tên trường trong frontmatter: `camelCase`, khớp đúng tên trường trong schema Zod.
- Trường tham chiếu sang collection khác dùng `reference()` và đặt tên theo collection
  đích ở số ít/nhiều tương ứng: `brand: reference("brands")`, `relatedPosts: z.array(reference("posts"))`.
- Bỏ trường `slug` khai tay trong frontmatter — slug là **id của entry** (tên file).

### CSS

- Class theo **BEM**: `block__element--modifier`, tất cả kebab-case —
  `review-layout__main`, `brand-card--featured`. (Đang dùng rồi, giữ và áp dụng đều.)
- Tên block trùng khái niệm của component, không trùng tên thẻ HTML.
- Custom property gom theo nhóm tiền tố: `--color-*`, `--font-*`, `--space-*`,
  `--container-*`. Đặt tên theo **vai trò** chứ không theo giá trị:
  `--color-primary` chứ không phải `--color-orange`.

### URL

Vì site **chưa index**, đợt tái cấu trúc này được sắp xếp lại toàn bộ URL một lần
duy nhất — xem bản đồ URL chốt ở §8.3. Quy tắc:

- Tất cả kebab-case, kết thúc bằng `/`.
- Bài viết nằm **dưới chuyên mục của nó**, không nằm ở gốc.
- Không nhét chữ thừa vào slug: `/about/` chứ không phải `/about-page/`;
  `/reviews/ollie/` chứ không phải `/reviews/ollie-review/` (đã có `/reviews/` rồi).
- Slug = id của entry trong collection, không khai tay trong frontmatter.

**Sau đợt này, URL đóng băng.** Site chạy thật là hết cửa đổi — mọi thay đổi về sau
đều phải kèm 301 ở tầng host và vẫn mất một phần thứ hạng.

## 8. Kiến trúc đã chốt

Chốt sau khi rà từng phần. Đây là bản thiết kế để thi công, không phải gợi ý.

### 8.1 Gói cài thêm

Giữ dependency ở mức tối thiểu — càng ít gói càng dễ nâng cấp Astro về sau.

| Gói | Loại | Vì sao |
|---|---|---|
| `@astrojs/sitemap` | dep | Sinh sitemap.xml. Cần `site` trong config mới chạy. |
| `@astrojs/check` + `typescript` | dev | Bật `astro check`. Hiện `tsconfig` đã `strict` nhưng không ai chạy typecheck nên strict đang vô nghĩa. |
| `prettier` + `prettier-plugin-astro` | dev | Format thống nhất — điều kiện cần để §7 có ý nghĩa. |

Đã có sẵn: `astro` 7.1.4, `@astrojs/mdx` 7.0.3, `sharp` (theo astro, không khai riêng).

**Cố tình KHÔNG cài** — quan trọng ngang phần trên:

- **Tailwind.** CSS hiện tại là bản sao pixel của site gốc và đã có design token.
  Chuyển sang Tailwind = viết lại 100% CSS = rủi ro lệch giao diện cao nhất có thể,
  đúng vào thứ §4 cấm. Một site 10 trang tĩnh gần như không hưởng lợi gì.
- **React / Vue / Svelte.** ExitPopup, ToTop, FaqAccordion, carousel đều làm được
  bằng `<script>` vanilla. Zero JS framework là **tính năng**, không phải thiếu sót —
  Core Web Vitals ảnh hưởng trực tiếp tới thứ hạng và doanh thu aff.
- **`astro-seo`.** Tiết kiệm ~40 dòng, đổi lại một dependency. Tự viết `Seo.astro`.
- **`astro-compress`.** Astro đã minify khi build.
- **Partytown, RSS, Stylelint, ESLint.** Chỉ cài khi thực sự dùng tới.

Hướng mở: nếu sau này cần người không biết code sửa nội dung, **Keystatic** ghép rất
hợp với content collection — kiến trúc dưới đây khiến việc ghép gần như không tốn công.

### 8.2 Cấu hình

`astro.config.mjs`:
- `site: 'https://top10dogfood.com'` — bắt buộc, thiếu thì không có canonical lẫn sitemap
- `trailingSlash: 'always'` — mọi URL kết thúc bằng `/`
- `integrations: [mdx(), sitemap()]`
- giữ `markdown.smartypants: false`

`tsconfig.json`: thêm alias `@/*` → `src/*`. Chỉ một alias, không chia nhỏ.

`package.json`: thêm `check` (`astro check`), `format`, `format:check`.

Thêm `public/robots.txt` trỏ tới sitemap.

### 8.3 Bản đồ URL

```
/                                                          trang chủ
/reviews/                                                  listing review
/reviews/the-pets-table/
/reviews/ollie/
/reviews/spot-tango/
/reviews/we-feed-raw/
/reviews/freshpet/
/reviews/sundays-for-dogs/                 ← sửa lỗi thiếu "s" của bản cũ
/knowledge/                                                listing bài viết
/knowledge/understanding-fresh-pet-food-is-it-a-healthier-choice/
/knowledge/fresh-vs-freeze-dried-dog-food-how-do-they-compare/
/knowledge/supporting-your-dogs-gut-health-for-a-happier-life/
/knowledge/why-fresh-food-is-the-best-for-dogs/
/knowledge/what-makes-healthy-pet-food/
/knowledge/a-detailed-look-at-dog-food-alternatives/
/about/                                    ← từ /about-page/
/contact/                                  ← từ /contact-us/
/privacy-policy/
/terms-of-use/
/advertiser-disclosure/
```

Lồng bài viết vào chuyên mục còn sửa được một chi tiết đang gợn: breadcrumb bài blog
hiện là `Home > - > tiêu đề` — dấu `-` chính là **chuyên mục rỗng**, di chứng của việc
bài viết không thuộc đâu cả. Lồng vào `/knowledge/` thì thành `Home > Knowledge > tiêu đề`
một cách tự nhiên.

### 8.4 Mô hình dữ liệu

Nguyên tắc: **tách *đối tượng là ai* khỏi *nó xuất hiện thế nào ở trang nào***.

**`content/brands/*.yaml`** — danh tính đối tác, khai một lần duy nhất:
```yaml
name: "The Pet's Table"
logo: ../../assets/brands/the-pets-table.svg
logoMobile: ...            # chỉ khai khi mobile khác desktop
logoAlt: "The Pet's Table Official Logo | Fresh Dog Food Delivery"
affiliateUrl: "#"          # ← LINK AFF DUY NHẤT
```

**`content/placements/*.yaml`** — brand đó được xếp hạng thế nào ở từng trang:
```yaml
# homepage.yaml
- brand: the-pets-table    # reference('brands')
  rank: 1
  rating: "9.9"
  ratingLabel: Outstanding
  stars: 5
  reviewsCount: "2,452"
  tagline: " Best Fresh Food Brand"
  bullets: [...]
  coupon: "Get 60% off your 1st box + 20% off your 2nd"
  isEditorsChoice: true
```
`reviews-page.yaml` và `review-sidebar.yaml` là các bảng riêng, **thứ tự và điểm khác
trang chủ** — khác biệt đó giờ là chủ ý tường minh chứ không phải hai bản sao tình cờ
lệch nhau.

**`content/posts/*.mdx`** — bài viết. Các thumbnail khác nhau gom vào một trường thay
vì tách ra 4 file dữ liệu. **Đúng 4 slot** — cùng một bài dùng 4 ảnh KHÁC NHAU ở 4 vị
trí, đây chính là lý do dữ liệu bị tách ra 4 nơi ban đầu:
```yaml
images:
  card: ./images/knowledge-understanding.jpg          # lưới /knowledge/
  mustRead: ./images/must-reads-fresh-food.jpg        # MustReads trang chủ
  reviewSidebar: ./images/article-why-fresh.jpg       # sidebar trang review
  blogSidebar: ./images/blog-mustread-why-fresh.jpg   # sidebar bài viết
relatedPosts: [what-makes-healthy-pet-food, ...]  # reference('posts')
author: steve-diller                              # reference('authors')
```
Cross-wiring 4 ảnh này là lỗi dễ mắc nhất và khó thấy nhất trong cả đợt — harness
kiểm bằng sha256 của file phát ra, không kiểm bằng tên.

**`content/authors/*.yaml`**, **`content/reviews/*.mdx`**, **`content/faq/*.yaml`**
theo cùng nguyên tắc. `reviews` trỏ `brand: reference('brands')`.

Kết quả: `src/data/` biến mất hoàn toàn, cùng với `ARTICLE_MAP` và `AVATARS` đang
hardcode trong component/layout. Lưới `/knowledge/`, sidebar "Must Reads" và sidebar
trang review đều **sinh ra từ collection `posts`**, không còn danh sách khai tay.
Gõ sai tên brand hay tác giả trở thành **lỗi build**, không phải `undefined` âm thầm.

Định dạng dữ liệu dùng **YAML** (hợp với chuỗi có dấu nháy cong và em-dash hơn JSON).
Đã kiểm chứng với tài liệu Astro 7: `glob()` loader hỗ trợ YAML/JSON/TOML, `reference()`
và `image()` trong schema hoạt động đúng như mô hình này cần.

### 8.5 Routing

Lồng URL theo chuyên mục nên **không còn va chạm route ở gốc** — không cần gộp
`getStaticPaths()`:

```
pages/
├─ index.astro
├─ reviews/
│  ├─ index.astro           listing
│  └─ [brand].astro         sinh từ collection reviews
├─ knowledge/
│  ├─ index.astro           listing, sinh từ collection posts
│  └─ [slug].astro          sinh từ collection posts
├─ about.astro
├─ contact.astro
├─ privacy-policy.astro
├─ terms-of-use.astro
└─ advertiser-disclosure.astro
```

Thêm một bài viết = thêm **đúng một file `.mdx`**. Không đụng tới code.

### 8.6 Cấu trúc thư mục

```
web/
├─ public/
│  ├─ fonts/                    # woff2 self-host — giữ nguyên
│  ├─ favicon.svg
│  └─ robots.txt                # THÊM
│
├─ src/
│  ├─ assets/
│  │  ├─ brands/                # logo đối tác — nguồn duy nhất
│  │  ├─ authors/
│  │  ├─ icons/
│  │  └─ images/{hero,promos,thumbnails}/
│  │
│  ├─ components/
│  │  ├─ layout/     Header, Footer, Breadcrumbs, ToTop, ExitPopup
│  │  ├─ ui/         ScoreRing, StarRating, Coupon, Paragraph, PartnerTooltip
│  │  ├─ brand/      BrandCard, ReviewCard, ProsCons, PartnerCard
│  │  ├─ article/    InnerNavigator, ArticleLink, InlineCta, FaqAccordion,
│  │  │              BlogIntro, ReviewIntro
│  │  ├─ sidebar/    BlogSidebar, ReviewSidebar, MustReads
│  │  └─ sections/   Hero, Toplist, BestOverall, MiniReview, ContentGrid,
│  │                 KnowledgeGrid, ContactCards, PromoBanner
│  │
│  ├─ content/
│  │  ├─ brands/         *.yaml
│  │  ├─ placements/     *.yaml
│  │  ├─ reviews/        *.mdx
│  │  ├─ posts/          *.mdx
│  │  ├─ authors/        *.yaml
│  │  └─ faq/            *.yaml
│  │
│  ├─ layouts/
│  │  ├─ BaseLayout.astro      # <html> + head + SEO
│  │  ├─ PageLayout.astro      # Header + Hero + Breadcrumbs + Footer + ToTop
│  │  └─ ArticleLayout.astro   # lưới nav/main/sidebar — dùng chung review & post
│  │
│  ├─ pages/                   # xem §8.5
│  │
│  ├─ lib/
│  │  ├─ rankings.ts           # nối placement → brand
│  │  ├─ stars.ts
│  │  ├─ seo.ts
│  │  └─ schema-org.ts         # JSON-LD
│  │
│  ├─ styles/
│  │  ├─ tokens.css            # tách token ra khỏi global (CẮT-DÁN, không viết lại)
│  │  ├─ global.css            # reset + base
│  │  └─ prose.css             # .prose--post + .prose--review (xem cảnh báo dưới)
│  │
│  ├─ config/site.ts
│  └─ content.config.ts
│
├─ astro.config.mjs · tsconfig.json · .prettierrc · CLAUDE.md
```

Ba điểm đáng chú ý: **`src/data/` biến mất** (nội dung → `content/`, logic → `lib/`) —
thư mục `data/` là chỗ trú của những thứ chưa quyết được là gì, bỏ nó buộc mỗi file
phải chọn phe. **6 thư mục `pages/<slug>/index.astro` biến mất.** **Style thân bài MDX
tách khỏi layout.**

> ⚠️ **`prose.css` dùng chung FILE, không dùng chung RULE.**
> Có **ba** bộ rule prose độc lập chứ không phải hai: `BlogPost.astro` (`.post__body`),
> `Paragraph.astro` (`.paragraph__content`), `Article.astro` (`.article`).
> `.post__body` có `h2:first-of-type / h3:first-of-type { margin-top: 0 }`,
> `.paragraph__content` **không có** — đã xác minh trong file. Mà **trang review chứa
> 4 khối `<Paragraph>`**, nên gộp rule sẽ khiến `:first-of-type` khớp 4 lần thay vì 1,
> âm thầm xoá `0.83em` margin bốn lần trên mỗi trang review. `.paragraph__content` còn
> sở hữu riêng `h1`, `ol` và toàn bộ style bảng giá mà `.post__body` không có.
>
> → `prose.css` chứa **hai khối tách biệt** `.prose--post` và `.prose--review`, chép
> nguyên văn từ hai nguồn, **không hợp nhất**. **Không đụng `Article.astro`.**
> Chuyển rule `:global()` ra khỏi `<style>` scoped cũng đổi tầm với của chúng:
> `.post__body:where([data-astro-cid-x]) p` thành `.post__body p`.

### 8.7 Ngoài phạm vi — kỷ luật scope

Những việc trông có vẻ "dọn cho sạch" nhưng sẽ phá vỡ §4. Đừng làm:

- **Không tách nhỏ component lớn.** `PartnerCard` (858 dòng), `MiniReview` (712),
  `ReviewSidebar` (642) chỉ đổi thư mục, không đổi nội dung. Lý do kỹ thuật: scoped
  style của Astro chỉ áp cho element nằm trong template của **chính** component đó —
  tách markup ra component con đẩy element khỏi scope cha và mọi rule cha nhắm tới
  chúng ngừng khớp. §8.6 yêu cầu chia **thư mục**, không yêu cầu chia **file**.
- **Không đổi tên asset**, chỉ dời. Astro phát `/_astro/<basename>.<hash>.<ext>` —
  basename nằm trong URL, đổi tên file là đổi URL của ảnh trên trang.
- **Không chạy prettier lên `src/components/**` và `src/layouts/**`.**
  `prettier-plugin-astro` reformat template HTML, mà **khoảng trắng giữa các inline
  element render thành dấu cách**. Trên codebase cố ý giữ `"Visit Site "` và
  `<p>&nbsp;</p>`, đây là hành động có tỷ lệ rủi ro/lợi ích tệ nhất. Chỉ format file
  mới tinh. Tương tự: **không thêm `.gitattributes`** trong đợt tái cấu trúc.
- **Không đụng nền tảng CSS**: `html` 14px→16px tại 1025px, `body { line-height: 1.7em }`
  (là `em` chứ không phải unitless — đổi sẽ tính lại trên từng element thay vì kế thừa
  giá trị px), `html { width: 100vw; overflow-x: hidden }`, `ul,ol { list-style: none }`.
  Giữ cả `--font-ui` trỏ "Work Sans" không bao giờ được load (lỗi bản gốc, cố ý tái tạo).
- **Không dedupe prose trùng lặp bằng cách parse MDX.** `reviews.ts.text` và
  `miniReview.summary` là bản sao nguyên văn đoạn đầu thân bài review. Nâng thành
  trường `excerpt` trong frontmatter, **không** suy ra bằng cách bóc AST — chuỗi chứa
  `’` và `—` phải sống sót byte-exact dưới `smartypants: false`.
- **Không gộp** `articles/why-fresh-dog-food.mdx` với
  `blog/why-fresh-food-is-the-best-for-dogs.mdx`. Hai file trùng nhau gần hết nhưng
  **khác đúng một từ** (giới thiệu "The Pet's Table" vs "The Farmer's Dog"). Giữ cả
  hai, comment chỗ khác biệt.
- **Đóng băng markup 4 trang prose** (`about`, `privacy-policy`, `terms-of-use`,
  `advertiser-disclosure`) — chỉ đổi vị trí file. `terms-of-use` có **0 heading**;
  9 tiêu đề mục của nó là `<p>` in hoa styled y hệt body. Danh sách là **giả**, dựng
  bằng `<br />` trong một `<p>`. `display: flow-root` có ở terms+disclosure nhưng
  **không** ở about+privacy, và margin đáy 46px vs 30px cùng ra một khoảng cách nhờ
  margin-collapse. Đừng "sửa" thành `<ul>` hay heading thật.
- **Không đụng giá trị `href` affiliate** — tất cả là `#` theo thiết kế. Gộp về một
  `affiliateUrl` mỗi brand là trong phạm vi; điền link thật thì không.
- Review MDX dùng `#` (h1) cho mục kết bài và **nó có xuất hiện trong TOC**. Đó là
  hành vi hiện tại — giữ nguyên dù trông như bug.

## 8.8 Tiến độ tái cấu trúc

Branch `refactor/astro-architecture`, tag `pre-refactor` = trạng thái trước khi bắt đầu.

| GĐ | Nội dung | Gate |
|---|---|---|
| 0 | Lưới an toàn + harness kiểm chứng | self-test 4/4 artifact tất định |
| 1 | Tooling + config | `dist` byte-identical 86/86 |
| 2 | 31 component vào 6 nhóm thư mục | 0/20 trang khác biệt |
| 3a | brands + placements + authors + faq + mini-review + contact-cards | 0/20 |
| 3b | Dữ liệu bài viết → collection blog; `src/data/` biến mất | 0/20 |
| 4 | Sắp xếp assets theo thư mục (không đổi tên) | 0/20, 0 file đổi basename |
| 5 | **Lồng URL + route động** | route khớp §8.3 từng dòng; body diff chỉ breadcrumb |
| 6 | SEO: canonical, OG/Twitter, JSON-LD, sitemap, robots | body diff 0; head thuần cộng thêm |
| 7 | Format | **hoãn có chủ ý** — xem §8.7 |

Xác minh đầy đủ GĐ3 bằng harness (20 trang × 11 khổ + 13 probe):
`dom` / `layout` / `assets` **giống hệt**; `behavior` giống hệt sau khi vá 2 lỗi
của chính harness (cid lọt vào chuỗi lỗi Playwright; probe ToTop đo opacity giữa
lúc transition chạy).

**TÁI CẤU TRÚC ĐÃ HOÀN TẤT.** Ba loại khác biệt được phép ở §4 đều đã dùng đúng
một lần và không hơn: URL đổi theo §8.3, breadcrumb `-` → `Knowledge`, meta
description tiếng Việt → tiếng Anh.

> ⚠️ **URL kể từ đây ĐÓNG BĂNG.** Mọi thay đổi về sau phải kèm 301 ở tầng host
> và vẫn mất một phần thứ hạng. Xem §7.

### Việc tồn đọng đã biết

- **6 file orphan trong `dist/_astro/` (~120KB)** — `image()` trong schema
  collection khiến Astro phát cả file gốc bên cạnh bản `.webp` mà `<Image>` sinh:
  `author-{peri-elgrot,steve-diller}.png`, `contact-{feedback,help,partner}.png`,
  `must-reads-alternatives.jpg`. **Không trang nào tham chiếu** → không lệch giao
  diện, chỉ là rác build.
  Đã thử truy nguyên: không phải do cách gọi `<Image>` (mọi consumer đều dùng
  `<Image>` giống nhau), cũng không theo định dạng file. `must-reads-fresh-food.jpg`
  dùng ở HAI vị trí thì KHÔNG sinh orphan, còn `must-reads-alternatives.jpg` dùng ở
  một vị trí thì có — nên có vẻ liên quan số biến thể `<Image>` sinh ra.
  Là hành vi nội bộ của Astro khi resolve ảnh qua `image()`. **Chưa xử lý** —
  cần điều tra riêng, không đáng chặn tiến độ vì không ảnh hưởng render.
- **Chưa làm, cân nhắc sau:** tách `styles/tokens.css` + `styles/prose.css` khỏi
  `global.css`/`BlogPost.astro` (§8.6). Nhớ cảnh báo ở §8.6: dùng chung FILE,
  KHÔNG dùng chung RULE.
- **Chưa làm:** frontmatter review vẫn giữ `author` inline, `partner` dạng chuỗi,
  `href`, `carouselPromo`, `articleLinkName` — trùng với `content/brands/*.yaml`.
  Đổi sang `reference()` sẽ xoá nốt lớp trùng lặp cuối cùng.
- **Chưa làm:** `data-dump.json` trong `_verify/reports/` là bản trích dữ liệu cũ,
  giữ để đối chiếu; xoá được khi đã yên tâm.

### Bài học vận hành harness

- **Không build lại trong lúc harness đang chụp** — `dist/` bị ghi đè giữa chừng
  làm hỏng cả lần chụp (đã gặp thật).
- Git Bash biến `--pages=/` thành đường dẫn Windows → đặt `MSYS_NO_PATHCONV=1`.
- Self-test phải chạy trên **nhiều trang**, không chỉ 1–2: flake của probe ToTop
  chỉ lộ ra ở trang review, không lộ ở trang chủ.

## 9. Cách xác minh sau khi sửa

Không được coi là xong nếu chưa kiểm chứng giao diện:

1. `npm run build` và `npm run check` phải sạch — không lỗi, không cảnh báo mới.
2. So sánh **danh sách route sinh ra** với bản đồ URL ở §8.3 — phải khớp đúng từng
   dòng, không thiếu không thừa. Đây là lần đổi URL duy nhất; sai sót lúc này sẽ
   phải sống chung vĩnh viễn.
3. So sánh trực quan từng nhóm trang ở ít nhất 2 breakpoint (mobile `<768px` và
   desktop `≥1025px`): trang chủ, `/reviews/`, một trang review, một bài viết,
   `/knowledge/`, một trang tĩnh.
4. Đối chiếu **nội dung chữ** trước/sau từng ký tự ở các trang trên — kể cả khoảng
   trắng thừa trong `alt` và tagline.
5. Giữ lại các comment giải thích chi tiết "cố ý sao chép bản gốc" — chúng là lý do
   tồn tại của nhiều đoạn code trông có vẻ thừa.
6. Kiểm tra `sitemap-index.xml` liệt kê đủ mọi trang, và không trang nào lọt vào
   sitemap mà lại `noindex`.

## 10. Development

Chạy dev server ở chế độ nền:

```
astro dev --background
```

Quản lý bằng `astro dev stop`, `astro dev status`, `astro dev logs`.

## 11. Tài liệu tham khảo

Tài liệu đầy đủ: https://docs.astro.build

Đọc trước khi làm việc liên quan:

- [Thêm trang, route động, middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Images & assets](https://docs.astro.build/en/guides/images/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Framework components (React/Vue/Svelte)](https://docs.astro.build/en/guides/framework-components/)
