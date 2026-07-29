# CLAUDE.md

Hướng dẫn cho AI agent làm việc trong repo này.

Bối cảnh dự án, lệnh chạy và công thức thêm nội dung nằm ở **`README.md`** —
đọc file đó trước. Ở đây chỉ ghi những gì không đọc ra được từ code.

---

## Lệnh

```sh
npm run dev      # máy chủ phát triển, localhost:4321
npm run check    # astro check (kiểu) + check-content.mjs (quy ước nội dung)
npm run build    # chạy check rồi dựng site tĩnh vào dist/
npm run format   # prettier cho mọi thứ trừ src/content/**
```

`scripts/check-content.mjs` gánh hai luật mà `astro check` không thấy được:
**nội dung hiển thị chỉ dùng ASCII**, và **URL trần trong `src/content/**` phải
được bọc** (`{'https://...'}` để giữ dạng chữ, `[chữ](url)` để thành link).
Luật thứ hai là điều kiện để giữ `gfm` bật: gfm tự biến URL trần thành thẻ `<a>`,
và trên site affiliate đó là rò traffic ra ngoài mà không có gì báo.

## Kiến trúc

Astro 7, static site, **không dùng UI framework**. Mọi tương tác (popup thoát
trang, accordion, carousel, drawer mobile, cuộn lên đầu) viết bằng `<script>`
vanilla trong chính component. Đây là lựa chọn có chủ đích: site sống bằng
traffic tìm kiếm, và zero JS framework giúp Core Web Vitals.

### Nội dung tách khỏi code

Toàn bộ nội dung biên tập nằm trong `src/content/` dưới dạng content collection
có schema Zod. Không có mảng dữ liệu nào nằm trong `.ts` hay hardcode trong
component. Thêm brand hay bài viết là thêm file nội dung, không sửa code.

### Ý tưởng trung tâm: brands vs placements

Đây là chỗ dễ hiểu nhầm nhất nếu chỉ nhìn thư mục.

- **`content/brands/`** — _đối tác LÀ AI_: tên, logo, alt, link affiliate.
  Bất biến, khai một lần.
- **`content/placements/`** — _đối tác XUẤT HIỆN THẾ NÀO ở từng trang_: thứ tự,
  điểm số, số sao, coupon.

Tách như vậy vì trang chủ và `/reviews/` xếp hạng **khác nhau** cho cùng một tập
brand. Nếu gộp làm một thì hoặc phải nhân đôi dữ liệu, hoặc mất khả năng cho hai
trang xếp khác nhau.

Hệ quả thực tế: đổi link affiliate là sửa **một dòng** trong `brands/`, và mọi
nơi hiển thị nó đều đổi theo.

`src/lib/rankings.ts` nối hai thứ đó lại. `src/lib/posts.ts` làm việc tương tự
cho bài viết.

### Quan hệ giữa collection

Dùng `reference()` chứ không dùng chuỗi tra bảng. Gõ sai tên brand, tác giả hay
bài viết là **lỗi build**, không phải `undefined` âm thầm lúc chạy.

### Routing

Route sinh từ tên file trong collection:

| Route                          | Sinh từ                 |
| ------------------------------ | ----------------------- |
| `pages/reviews/[slug].astro`   | `content/reviews/*.mdx` |
| `pages/knowledge/[slug].astro` | `content/posts/*.mdx`   |
| `pages/[page].astro`           | `content/pages/*.mdx`   |

`[page].astro` sinh 4 trang nội dung phẳng ở gốc site (`/about/`,
`/terms-of-use/`, `/privacy-policy/`, `/advertiser-disclosure/`). Nó KHÔNG nuốt
route khác: build tĩnh chỉ phát đúng path mà `getStaticPaths` trả về, và
`[page]` chỉ khớp một segment. Ràng buộc kèm theo: id entry trong `content/pages`
không được trùng `contact`, `reviews`, `knowledge`.

Slug **là** id của entry (tên file) — không khai `slug` trong frontmatter. Hai
nguồn sự thật cho URL từng gây ra một URL sai chính tả trong dự án này.

Mọi URL nội bộ dựng qua **`src/lib/links.ts`**. Đừng gõ tay đường dẫn trong
component — đổi cấu trúc URL sẽ phải sửa một chỗ thay vì tám chỗ.

### `layouts/` chỉ chứa thứ bọc trang khác

Phép thử: một file thuộc về `layouts/` khi nó có **`<slot />`**. Không có slot
thì nó không bọc ai — nó _là_ thân của một trang, và chỗ của nó là `pages/`.

Đúng hai file, xếp hai tầng, ranh giới là **tài liệu** so với **khung nhìn thấy được**:

|         | `BaseLayout`                                            | `InnerPageLayout`                                                                                  |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Phát ra | `<html>` · `<head>` · Seo · `global.css`                | Header · HeroInner · Breadcrumbs · Footer · ToTop                                                  |
| Props   | metadata: `title` `description` `image` `type` `schema` | banner + breadcrumb: `heroTitle` `heroMobileTitle` `heroAlt` `heroMobileAlt` `isTitleTop` `crumbs` |

Hai bộ props không giao nhau: `InnerPageLayout` chuyển thẳng 5 props metadata
xuống dưới mà không đọc cái nào. Cần cả hai tầng vì trang chủ dùng riêng
`BaseLayout` — nó không có breadcrumb, banner là `HeroHome` với cây DOM khác
hẳn, `<main>` bọc luôn banner, và chỉ nó có `ExitPopup`. Gộp một tầng thì trang
chủ phải tắt từng thứ bằng prop `showBreadcrumbs={false}` — prop trình bày trá
hình, đúng thứ quy ước cấm.

`InnerPageLayout` **không phát `<main>`**: trang review và bài blog đặt `<main>`
bên trong lưới ba cột, bọc sẵn sẽ thành `<main>` lồng `<main>`.

Lưới ba cột đó là `components/layout/ArticleGrid.astro` — component, không phải
layout, vì nó là một khối bố cục chứ không phải vỏ trang (cùng lý do
`ContentGrid` của trang chủ nằm ở `components/`). Nó có ba slot **có tên**
(`nav` / `main` / `sidebar`) nên thứ tự cột do nó quyết; và nó cố ý **không**
khai `grid-template-areas`, vì trước đây cả hai trang đều khai mà không con nào
nhận `grid-area` — thứ xếp cột thật luôn là auto-placement theo thứ tự DOM.

### Style

| File                | Vai trò                                                     |
| ------------------- | ----------------------------------------------------------- |
| `styles/tokens.css` | Token đặt theo VAI TRÒ (`--color-text-body`, `--font-*`)    |
| `styles/global.css` | `@font-face`, reset, import ba file kia                     |
| `styles/prose.css`  | Style cho thân bài do MDX render — BỐN khối, cố ý không gộp |
| `styles/hero.css`   | Khung banner dùng chung của `HeroHome` và `HeroInner`       |

Ngoài ra mỗi component tự giữ style trong `<style>` scoped của nó.

`hero.css` là file global vì hai component hero render cùng bộ class khung, mà
scoped style không xuyên qua ranh giới component — chép vào cả hai file là tạo
lại đúng thứ trùng lặp vừa gỡ. Rule ở đó là class trần (0,1,0) nên luôn thua rule
scoped (0,2,0) của từng nhánh: khung là nền, nhánh đè lên.

`tokens.css` ghi sẵn quy tắc để một giá trị được thành token: **dùng ≥3 chỗ VÀ
mọi chỗ cùng một vai trò**. Vì vậy có ba token cùng `#ffffff` (`--color-bg`,
`--color-surface`, `--color-text-on-primary`) — cố ý, đừng "dọn" thành một.

## Quy ước đặt tên

**File**

| Loại                     | Quy ước                              | Ví dụ                             |
| ------------------------ | ------------------------------------ | --------------------------------- |
| Component, layout        | PascalCase, tên file = tên component | `ReviewCard.astro`                |
| Page                     | kebab-case, khớp URL                 | `contact.astro`                   |
| Route động               | `[tham-số].astro`                    | `[slug].astro`                    |
| Module `lib/`, `config/` | kebab-case                           | `schema-org.ts`                   |
| File nội dung            | kebab-case, chính là slug            | `what-makes-healthy-pet-food.mdx` |
| Asset, thư mục           | kebab-case                           | `steve-diller.png`                |

Không dùng tên chung chung như `utils.ts` / `helpers.ts` — đặt theo việc nó làm.

**Code**

- Biến, hàm, thuộc tính: `camelCase`; hàm mở đầu bằng động từ
- Boolean có tiền tố `is` / `has` / `should` / `can`
- Type, interface: `PascalCase`, không tiền tố `I`. Props component luôn tên `Props`
- Hằng bất biến cấp module: `UPPER_SNAKE_CASE`
- Collection và mảng dùng số nhiều, phần tử số ít
- Tên nói **cái đó là gì**, không nói nó nằm ở đâu

**CSS**

- BEM: `block__element--modifier`, kebab-case
- Custom property đặt theo **vai trò**, không theo giá trị —
  `--color-primary`, không phải `--color-orange`

**Nội dung**

- Trường frontmatter: `camelCase`, khớp schema Zod
- Quan hệ giữa collection dùng `reference()`

## Quy ước commit

Viết bằng **tiếng Việt**, ngắn gọn. Dạng: `type(scope): mô tả` — `scope` không bắt buộc.

**Type** dùng đúng chuẩn conventional commits:

| Type       | Dùng khi                                      |
| ---------- | --------------------------------------------- |
| `feat`     | Thêm tính năng                                |
| `fix`      | Sửa lỗi                                       |
| `refactor` | Đổi cấu trúc, không đổi hành vi               |
| `style`    | Chỉ đụng định dạng/giao diện, không đổi logic |
| `perf`     | Cải thiện hiệu năng                           |
| `docs`     | Tài liệu                                      |
| `test`     | Kiểm thử                                      |
| `build`    | Dependency, cấu hình build                    |
| `chore`    | Việc lặt vặt còn lại                          |

**Scope** thêm khi phạm vi rõ ràng, bỏ khi thay đổi trải rộng nhiều phần:

```
feat(toplist): thêm huy hiệu giảm giá cho card hạng 1
fix(header): drawer mobile không đóng khi bấm overlay
refactor: gom logic dựng URL về lib/links.ts
docs: cập nhật công thức thêm brand
```

Không thêm dòng `Co-Authored-By`.

## Những điều dễ vấp

Không phải điều cấm — chỉ là những chỗ hành xử khác trực giác. Biết trước thì
đỡ mất thời gian truy nguyên.

### `rem` co theo breakpoint

`global.css` đặt `html { font-size: 14px }` và đổi thành `16px` từ `1025px`.
**Mọi giá trị `rem` trong site đều đi qua đây** — một component trông đúng ở
desktop có thể lệch ở mobile chỉ vì điều này. Đổi hai con số đó là đổi tỉ lệ
toàn site.

### `body { line-height: 1.7em }` dùng `em`, không phải unitless

`em` được tính **một lần** trên `body` rồi kế thừa xuống dưới dạng px cố định.
Unitless (`1.7`) sẽ tính lại trên từng element theo font-size riêng của nó. Hai
cách cho kết quả khác nhau ở mọi element có font-size khác body — đổi thì nhớ
kiểm lại toàn site.

### Scoped style không xuyên qua ranh giới component

Astro chỉ áp scoped style cho element nằm trong template của **chính** component
đó. Tách một phần markup ra component con thì mọi rule của cha nhắm tới phần đó
sẽ ngừng khớp. Muốn tách component lớn (`PartnerCard`, `MiniReview`,
`ReviewSidebar` đều >600 dòng) thì phải chuyển style theo, hoặc dùng `:global()`.

Cùng lý do: nội dung đưa vào qua `<slot />` hoặc do MDX render nằm **ngoài**
phạm vi scoped. Đó là vì sao style thân bài sống ở `styles/prose.css` (file
global) chứ không nằm trong `<style>` của `pages/knowledge/[slug].astro` hay
`Paragraph.astro` — hai file đó chỉ giữ style cho khung bao ngoài.

### `prose.css` có bốn khối, cố ý không gộp

`.post__body` (bài viết), `.paragraph__content` (bài review), `.page__body`
(trang nội dung phẳng) và `.article` (khối bài ở trang chủ) trông na ná nhau
nhưng khác ở chỗ quan trọng.

`.post__body` có `h2/h3:first-of-type { margin-top: 0 }`, `.paragraph__content`
không có — vì **một trang review chứa nhiều khối `<Paragraph>`**, nên
`:first-of-type` sẽ khớp một lần mỗi khối thay vì một lần mỗi trang.

`.page__body` dùng `> h2:first-child`, KHÔNG phải `:first-of-type`. Khác biệt
này là bắt buộc: khối đầu của trang privacy là `<p>` (câu mở đầu vốn bị bản gốc
đánh dấu `<h4>` nhầm), nên `h2:first-of-type` sẽ khớp một tiêu đề nằm GIỮA bài và
xoá margin ở đó. Cũng không được rút gọn thành `> :first-child`: rule đó sẽ ăn cả
`<p>` đầu của terms/disclosure và kéo hai trang lên 16px.

Muốn gộp thì phải xử lý cả hai điểm trên trước.

### Tên file asset nằm trong URL

Astro phát ảnh thành `/_astro/<basename>.<hash>.<ext>` — **basename là tên file
gốc**. Dời thư mục không ảnh hưởng URL, nhưng đổi tên file thì có. Nếu site đã
chạy thật, đổi tên ảnh sẽ làm hỏng link ảnh đã được index hoặc cache.

### `image()` trong schema phát cả file gốc

Ảnh khai bằng `image()` luôn được phát bản gốc bên cạnh bản `.webp` mà `<Image>`
sinh ra, vì `ImageMetadata.src` phải trỏ tới file có thật. Nếu markup chỉ dùng
`<Image>`, bản gốc nằm trong `dist/` mà không trang nào tham chiếu (~150KB hiện
tại). Không ảnh hưởng người dùng, chỉ là dung lượng deploy.

### Prettier format `.astro`, KHÔNG format `src/content/**`

Hàng rào cũ chặn cả `.astro` vì `prettier-plugin-astro` reflow template, mà
khoảng trắng giữa các inline element **render thành dấu cách**. Lý do đó gắn với
ba thứ nay đã bị xoá: `"Visit Site "` dấu cách cuối, `alt="Ollie  logo"` hai dấu
cách, `<p>&nbsp;</p>` làm spacer. Đã chạy thử và đối chiếu `dist/`: format toàn
bộ 26 file `.astro` cho ra body và CSS giống hệt.

`src/content/**` vẫn không format: Markdown nhạy cảm với khoảng trắng — thụt lề
quyết định danh sách lồng, dòng trống quyết định loose/tight (và nhịp dọc giữa
các mục theo đó mà đổi).

Vài chỗ trong template cố ý viết sát nhau, không có khoảng trắng (vd
`</svg><span>` trong `HeroHome`) — chúng đều có comment cảnh báo tại chỗ.

## Nội dung đến từ nguồn ngoài

Nội dung ban đầu được nhập từ một site có sẵn. Phần lớn dấu vết đã được dọn, ghi
lại đây để biết chúng từng tồn tại và vì sao không còn:

| Dấu vết                                                           | Đã xử lý                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| Dấu cách đôi/cuối trong `alt` và tên brand                        | bỏ — dữ liệu giữ TÊN, template và CSS giữ KHOẢNG CÁCH     |
| `<p>&nbsp;</p>` và dòng `&nbsp;` làm spacer                       | bỏ — thay bằng `margin` trong `prose.css`                 |
| Trang `terms-of-use` không có heading, danh sách dựng bằng `<br>` | `<h2>` + `<ul>`/`<ol>` thật, CSS giữ nguyên hình          |
| 54 `style={{...}}` vẽ viền trên từng `<td>`                       | gom về `prose.css`                                        |
| Nháy cong, em dash, ellipsis, ký tự chấm tròn                     | ASCII; `scripts/check-content.mjs` giữ cho không trôi lại |

Còn lại, cố ý giữ:

- Một brand có tới **năm biến thể tên** (`name`, `logoAlt`, `logoAltShort`,
  `sidebarName`, `articleLinkName`) vì nguồn dùng chuỗi khác nhau ở từng vị trí.
  Đây là dữ liệu thật, không phải trùng lặp.
- Bài review dùng `#` (h1) cho mục kết bài, nên nó xuất hiện trong mục lục.
- `--font-ui` khai `"Work Sans"` mà không nạp font đó — tái tạo có chủ ý lỗi của
  bản gốc.

## Khi thay đổi ảnh hưởng giao diện

`astro check` chỉ kiểm kiểu — nó **không** phát hiện được lỗi giao diện. Một prop
đổi tên mà quên phần destructure vẫn qua `astro check` sạch trong khi cả trang
render sai biến thể.

Với thay đổi đụng vào CSS, layout hay tên prop, nên dựng site trước/sau rồi so
`dist/` — chú ý bỏ qua `data-astro-cid-*` và hash trong `/_astro/`, vì hai thứ
đó đổi mỗi khi file component đổi đường dẫn.

## Tài liệu

Astro: https://docs.astro.build —
[routing](https://docs.astro.build/en/guides/routing/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[images](https://docs.astro.build/en/guides/images/) ·
[styling](https://docs.astro.build/en/guides/styling/)
