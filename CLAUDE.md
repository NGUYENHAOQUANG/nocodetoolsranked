# CLAUDE.md

Bối cảnh dự án, lệnh chạy và cách thêm nội dung nằm ở **`README.md`** — đọc file
đó trước, ở đây không lặp lại.

File này chỉ ghi những gì **không suy ra được từ code**: ràng buộc bắt buộc,
những chỗ trông như bug nhưng là cố ý, và lý do một số việc "dọn dẹp" hiển nhiên
lại bị cấm.

---

## 1. Nền tảng

Site tái tạo **pixel-perfect** một trang có sẵn. Hệ quả: rất nhiều chi tiết
trông thừa hoặc sai lại là bản sao có chủ ý, và "sửa" chúng chính là làm hỏng.

Thay đổi giao diện có chủ đích thì **được phép** — dự án không còn bị đóng băng
như thời tái cấu trúc. Nhưng thay đổi giao diện **ngoài ý muốn** là lỗi, và §5
nói cách phân biệt hai thứ đó.

## 2. Ràng buộc bắt buộc

### 2.1 URL đã đóng băng

Bản đồ URL ở README. Đổi URL = mất thứ hạng tìm kiếm, và phải kèm 301 ở tầng
host. Chỉ đổi khi có yêu cầu rõ ràng và chấp nhận cái giá đó.

Mọi URL nội bộ dựng qua `src/lib/links.ts`. Đừng gõ tay đường dẫn ở component —
đó chính là thứ đã mất công gom lại.

### 2.2 Không cài thêm những thứ này

| Cấm | Lý do |
|---|---|
| **Tailwind** | CSS hiện tại là bản sao pixel của bản gốc và đã có design token. Chuyển sang Tailwind = viết lại 100% CSS = rủi ro lệch cao nhất có thể, đổi lấy gần như không lợi ích cho một site 10 trang tĩnh. |
| **React / Vue / Svelte** | Không chỗ nào cần. ExitPopup, ToTop, FaqAccordion, carousel đều chạy bằng `<script>` vanilla. Zero JS framework là **tính năng** — Core Web Vitals ảnh hưởng trực tiếp tới thứ hạng và doanh thu affiliate. |
| **`astro-seo`** | Tiết kiệm ~40 dòng, đổi lấy một dependency. `components/layout/Seo.astro` đã tự làm. |
| **`astro-compress`** | Astro đã minify khi build. |

Muốn người không biết code sửa nội dung → **Keystatic** ghép rất hợp với content
collection, gần như không tốn công.

### 2.3 Không chạy prettier lên `.astro` / `.mdx`

`prettier-plugin-astro` reformat template HTML, mà **khoảng trắng giữa các inline
element render thành dấu cách**. Trên codebase cố ý giữ `"Visit Site "` và
`<p>&nbsp;</p>`, đây là hành động rủi ro/lợi ích tệ nhất có thể.

`.prettierignore` đã chặn cứng. Script `npm run format` cũng chỉ nhắm `.ts`/
`.yaml`/`.json`. Đừng nới hai chỗ đó. Tương tự: **đừng thêm `.gitattributes`** —
`* text=auto` renormalize toàn bộ file và phá sạch khả năng đọc diff.

### 2.4 Không đổi tên file asset

Astro phát `/_astro/<basename>.<hash>.<ext>` — **basename nằm trong URL**, nên
đổi tên file là đổi URL của ảnh trên trang. Dời thư mục thì được, đổi tên thì
không. Đó là lý do vẫn còn `blog-*.jpg` trong `assets/images/posts/` dù không
còn khái niệm "blog" nào.

## 3. Những chỗ trông như bug nhưng là cố ý

Đừng "sửa" bất kỳ mục nào dưới đây.

**Chuỗi và khoảng trắng**
- `alt="Ollie  Official Logo…"` — dấu cách đôi
- `sidebarName: "Ollie "` — dấu cách cuối, khác `name: "Ollie"`
- `"Visit Site "`, `"Contact Us "` — dấu cách cuối
- `<p>&nbsp;</p>` trong bài The Pet's Table — spacer chiếm 27.2px
- `hasTrailingBlank` của Ollie — đoạn rỗng làm card cao 314.83 thay vì 310

Một brand có **năm biến thể tên** (`name`, `logoAlt`, `logoAltShort`,
`sidebarName`, `articleLinkName`) vì chúng **không suy ra được từ nhau**:
`name: "Fresh Pet"` (hai từ) nhưng `articleLinkName: "Freshpet"` (một từ);
`name: "Ollie"` nhưng `sidebarName: "Ollie "` có dấu cách cuối.

**CSS**
- `--font-ui` khai `"Work Sans"` mà không nạp font — lỗi của bản gốc, tái tạo có chủ ý
- `html { font-size: 14px }` → `16px` tại `1025px` — **mọi `rem` toàn site đi qua đây**
- `body { line-height: 1.7em }` — là `em` chứ không phải unitless. Tính một lần trên body rồi kế thừa dạng px; đổi sang unitless sẽ tính lại trên từng element và làm lệch hàng loạt component
- `html { width: 100vw; overflow-x: hidden }` — căn giữa theo 100vw *kể cả* thanh cuộn. Bỏ `100vw` sẽ dịch mọi thứ ~15px
- Lưới bài viết gate `(min-width:1025px) and (min-height:420px)`; trang prose chỉ gate width. Bất đối xứng này là thật

**Markup 4 trang prose** (`about`, `privacy-policy`, `terms-of-use`, `advertiser-disclosure`)
- `terms-of-use` có **0 heading**; 9 tiêu đề mục là `<p>` in hoa styled y hệt body
- Danh sách là **giả**, dựng bằng `<br />` trong một `<p>` — đừng đổi thành `<ul>`
- `display: flow-root` có ở terms + disclosure nhưng **không** ở about + privacy
- Margin đáy 46px vs 30px cùng ra một khoảng cách nhờ margin-collapse

**Nội dung**
- Bài review dùng `#` (h1) cho mục kết và **nó có xuất hiện trong TOC**
- `images.reviewSidebar` của bài "a-detailed-look…" trỏ ảnh `must-reads-fresh-food.jpg` — tréo tên nhưng đúng bản gốc
- `articles/why-fresh-dog-food.mdx` gần trùng `posts/why-fresh-food-is-the-best-for-dogs.mdx`, **khác đúng một từ** ("The Pet's Table" vs "The Farmer's Dog"). Giữ cả hai
- 5 quy ước sinh `alt` khác nhau cho cùng một bài, tuỳ vị trí hiển thị

## 4. Hai chỗ cấm gộp / cấm tách

### `styles/prose.css` — dùng chung FILE, không dùng chung RULE

Có **ba** bộ rule prose độc lập: `.post__body` (PostLayout), `.paragraph__content`
(Paragraph), `.article` (FeaturedArticle — cố ý để nguyên trong component).

`.post__body` có `h2/h3:first-of-type { margin-top: 0 }`, `.paragraph__content`
**không có** — và **một trang review chứa bốn khối `<Paragraph>`**. Gộp rule lại
thì `:first-of-type` khớp 4 lần mỗi trang thay vì 1, âm thầm xoá `0.83em` margin
bốn lần. Vài giá trị trùng nhau chỉ là trùng hợp (`h3 margin 1em` và `1.25rem`
cùng ra 20px vì font-size h3 đúng bằng 1.25rem).

### Không tách nhỏ component lớn

`PartnerCard` (858 dòng), `MiniReview` (715), `ReviewSidebar` (648) giữ nguyên.
Scoped style của Astro chỉ áp cho element nằm trong template của **chính**
component đó — tách markup ra component con đẩy element khỏi scope cha và mọi
rule cha nhắm tới chúng ngừng khớp.

## 5. Kiểm chứng khi đụng vào giao diện

Có sẵn bộ so sánh ở `../_verify/` (ngoài repo):

```sh
cd web && npm run build
cd ../_verify/tool && MSYS_NO_PATHCONV=1 node verify.js --side=after
diff -r ../baseline/layout ../after/layout    # tín hiệu chính
diff -r ../baseline/dom ../after/dom
```

`layout` ghi `getBoundingClientRect()` + ~35 computed property của **mọi element,
mọi trang, 11 khổ màn** — đủ nhạy để bắt lệch 1px hay đổi một thuộc tính CSS.
`../baseline/` là bản dựng trước tái cấu trúc; muốn lấy mốc mới thì copy `dist/`
đè lên.

**Lưu ý vận hành**
- **Đừng build lại trong lúc harness đang chụp** — `dist/` bị ghi đè giữa chừng làm hỏng cả lần chụp
- Git Bash biến `--pages=/` thành đường dẫn Windows → đặt `MSYS_NO_PATHCONV=1`
- Probe `hover/` nhạy thời điểm đo; thấy lệch thì chạy lại riêng trang đó trước khi kết luận
- Self-test phải chạy **nhiều trang**, không chỉ 1–2

`astro check` **không** bắt được lỗi giao diện. Từng có lần đổi tên prop mà quên
phần destructure — mọi trang render nhầm biến thể hero, `astro check` vẫn báo 0
lỗi, chỉ harness phát hiện.

## 6. Quy tắc đặt tên

**File**

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component, layout | PascalCase, tên file = tên component | `ReviewCard.astro` |
| Page | kebab-case, khớp URL | `advertiser-disclosure.astro` |
| Route động | `[tham-số].astro` | `[brand].astro` |
| Module `lib/`, `config/` | kebab-case | `schema-org.ts` |
| File nội dung | kebab-case, chính là slug | `what-makes-healthy-pet-food.mdx` |
| Asset, thư mục | kebab-case | `author-steve-diller.png` |

Không có file `utils.ts` / `helpers.ts` / `misc.ts` — đặt tên theo việc nó làm.

**Code**
- Biến, hàm, thuộc tính: `camelCase`; hàm mở đầu bằng động từ
- Boolean có tiền tố `is` / `has` / `should` / `can`
- Type, interface: `PascalCase`, không tiền tố `I`. Props component luôn tên `Props`
- Hằng bất biến cấp module: `UPPER_SNAKE_CASE`
- Collection và mảng dùng **số nhiều**; phần tử số ít
- Tên nói **cái đó là gì**, không nói nó nằm ở đâu; không đặt theo trang đang dùng nếu thứ đó dùng lại được

**CSS**
- BEM: `block__element--modifier`, kebab-case
- Custom property theo nhóm `--color-*`, `--font-*`, `--container-*`, đặt theo
  **vai trò** chứ không theo giá trị (`--color-primary`, không phải `--color-orange`)

**Nội dung**
- Trường frontmatter: `camelCase`, khớp schema Zod
- Quan hệ giữa collection dùng `reference()` — gõ sai thành lỗi build
- Không khai `slug` bằng tay; slug là **id của entry** (tên file)

## 7. Lịch sử

Dự án từng qua một đợt tái cấu trúc lớn (18 commit): gom nội dung từ `src/data/`
vào content collection, xoá trùng lặp brand 4 nơi và bài viết 6 nơi, lồng URL
theo chuyên mục, thêm SEO.

Toàn bộ diễn biến, lý do từng quyết định và kết quả kiểm chứng nằm trong
commit message:

```sh
git log pre-refactor..HEAD        # tag pre-refactor = trạng thái trước đợt đó
```

## 8. Development

```sh
astro dev --background            # quản lý: astro dev stop | status | logs
```

Tài liệu Astro: https://docs.astro.build —
[routing](https://docs.astro.build/en/guides/routing/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[images](https://docs.astro.build/en/guides/images/) ·
[styling](https://docs.astro.build/en/guides/styling/)
