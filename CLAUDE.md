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

Ba script trong `scripts/` gánh những luật mà `astro check` không thấy được —
nó chỉ kiểm KIỂU:

| Script                | Kiểm gì                               | Chạy lúc          |
| --------------------- | ------------------------------------- | ----------------- |
| `check-content.mjs`   | nội dung chỉ ASCII; URL trần phải bọc | `npm run check`   |
| `check-structure.mjs` | component nằm đúng thư mục loại trang | `npm run check`   |
| `check-html.mjs`      | 10 luật HTML trên `dist/`             | sau `astro build` |

`check-html.mjs` chạy trên `dist/` chứ không phải `src/`, vì "trang này có mấy
`<h1>`" chỉ trả lời được trên HTML đã render. Nó nhận tham số thư mục nên soi
được một bản build khác: `node scripts/check-html.mjs ../ban-cu/dist`.

**Phép thử để một luật đáng có script:** người viết code có tự thấy được vi phạm
không. Ký tự vô hình thì không thấy; `<h1>` thứ hai do layout và thân MDX cộng
lại cũng không thấy; component mồ côi sau khi gỡ một section cũng không.

Luật "component nằm đúng thư mục loại trang" thì NGƯỢC LẠI — nhìn đường dẫn là
thấy. Đã từng có `check-structure.mjs` kiểm luật đó và đã bỏ: nó cần một bảng
`page -> loại trang` khai tay, nên thêm một loại trang mới là nó báo "không
trang nào dùng, xoá đi" cho chính component của trang mới rồi chặn build. Bộ
kiểm sai vào đúng lúc người ta đang làm kiến trúc thì hại hơn lợi. Luật vẫn còn
hiệu lực, chỉ là do người giữ chứ không do máy.

`scripts/check-content.mjs` gánh hai luật mà `astro check` không thấy được:
**nội dung hiển thị chỉ dùng ASCII**, và **URL trần trong `src/content/**` phải
được bọc** (`{'https://...'}` để giữ dạng chữ, `[chữ](url)` để thành link).
Luật thứ hai là điều kiện để giữ `gfm` bật: gfm tự biến URL trần thành thẻ `<a>`,
và trên site affiliate đó là rò traffic ra ngoài mà không có gì báo.

Luật ASCII quét cả `.ts`, không chỉ `.astro`/`.mdx`/`.yaml`: `config/site.ts` giữ
tiêu đề và mô tả mặc định, tức là chuỗi RENDER RA TRANG. Bỏ sót nó nên một em
dash từng sống sót ở đó và ship ra 8 trang trong khi mọi chỗ khác đã đổi.

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

Tách như vậy vì mỗi trang toplist (trang chủ và từng ngách) cùng `/reviews/` xếp
hạng **khác nhau** cho cùng một tập brand. Gộp làm một thì hoặc phải nhân đôi dữ
liệu, hoặc mất khả năng cho mỗi trang xếp một kiểu — mà đó chính là lý do tồn tại
của các ngách.

Hệ quả thực tế: đổi link affiliate là sửa **một dòng** trong `brands/`, và mọi
nơi hiển thị nó đều đổi theo.

`src/lib/rankings.ts` nối hai thứ đó lại. `src/lib/posts.ts` làm việc tương tự
cho bài viết.

### Trang toplist: một file = một trang

`content/toplists/<id>.mdx` là MỘT trang toplist hoàn chỉnh. Trang chủ là entry
`home`; mọi ngách khác lấy id làm slug ở gốc site. Thân MDX là bài viết dài dưới
bảng xếp hạng; frontmatter giữ tiêu đề, hero, FAQ, mini-review.

Bốn collection cũ (`featuredArticles`, `faq`, `miniReviews`, và chữ nghĩa hero
vốn viết cứng trong component) đều chỉ có ĐÚNG MỘT entry tên `homepage` — tức là
đã sẵn hình dạng "khoá theo trang", chỉ là mới có một trang. Gộp lại nên thêm một
ngách là thêm **một** file nội dung, không phải bốn.

Bảng xếp hạng thì KHÔNG gộp vào đó: nó dài 120 dòng cho 9 brand x 12 trường, và
nhịp sửa khác hẳn phần còn lại (điểm/coupon/thứ tự đổi hàng tuần, bài viết hàng
quý). Nó ở `content/placements/toplist/<id>.yaml`, nối bằng `reference()`.

**Bài kiểm nghiệm thu của mô hình này:** thêm một ngách phải chạy được với **0
dòng code**. Đã chạy thật — tạo hai file nội dung, build ra `/puppy-food/` với
cùng bộ khối, cùng thứ tự, 10 card, chỉ khác nội dung và thứ hạng. Đổi cấu trúc
gì sau này cũng phải giữ được tính chất đó.

### `components/` chia theo phạm vi trang phục vụ

Luật, không có chỗ nào cần phán đoán:

> Component nằm ở thư mục của loại trang duy nhất dùng nó. Dùng ở nhiều loại
> trang thì lên tầng chung gần nhất — `article/` nếu là review + blog, `layout/`
> nếu gần như mọi trang.

| Thư mục      | Phục vụ                         |
| ------------ | ------------------------------- |
| `layout/`    | mọi trang (6 file)              |
| `toplist/`   | trang chủ + mọi ngách (16 file) |
| `article/`   | trang review + bài blog (12)    |
| `reviews/`   | `/reviews/` (2)                 |
| `knowledge/` | `/knowledge/` (1)               |
| `contact/`   | `/contact/` (1)                 |

Trục này chọn vì **đơn vị lớn lên của repo là loại trang**: thêm brand hay thêm
bài chỉ là thêm file nội dung, còn component mới chỉ sinh ra khi có loại trang
mới — và khi đó sinh ra cả cụm. Thêm loại trang = tạo một thư mục, bỏ = xoá một
thư mục.

Đo được: lan truyền import từ mỗi page cho thấy **28/38 component chỉ xuất hiện ở
đúng một loại trang**, 6 cái ở gần như mọi trang, 4 cái ở đúng hai (review +
blog). Không cái nào ở giữa — nên luật trên gần như không có ca biên.

Trục CŨ (`sections/` `sidebar/` `ui/` `brand/`) cắt theo bốn thứ khác nhau cùng
lúc, và vị trí là thuộc tính của CÁCH DÙNG chứ không phải của component: dời một
khối từ sidebar vào thân bài là nó sai thư mục dù bản thân nó không đổi gì.

### Quan hệ giữa collection

Dùng `reference()` chứ không dùng chuỗi tra bảng. Gõ sai tên brand, tác giả hay
bài viết là **lỗi build**, không phải `undefined` âm thầm lúc chạy.

### Routing

Route sinh từ tên file trong collection:

| Route                          | Sinh từ                  |
| ------------------------------ | ------------------------ |
| `pages/[...toplist].astro`     | `content/toplists/*.mdx` |
| `pages/reviews/[slug].astro`   | `content/reviews/*.mdx`  |
| `pages/knowledge/[slug].astro` | `content/posts/*.mdx`    |
| `pages/[page].astro`           | `content/pages/*.mdx`    |

`[...toplist].astro` là route **rest**, sinh cả `/` lẫn mọi ngách ở gốc site.
Entry `home` cho ra param `undefined` → URL `/`, nên trang chủ và mọi ngách dùng
CHUNG một khuôn, không có `index.astro` riêng. Route rest xếp hạng thấp hơn route
động có tên nên nó KHÔNG nuốt `[page].astro` — đã kiểm bằng build. Ràng buộc: id
trong `toplists/` không được trùng id trong `pages/`, và `home` là id dành riêng.

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
`BaseLayout` — nó không có breadcrumb, banner là `HeroToplist` với cây DOM khác
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
| `styles/hero.css`   | Khung banner dùng chung của `HeroToplist` và `HeroInner`    |

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

### `tsconfig` bật `noUncheckedIndexedAccess`

`brands[0]` có kiểu `ToplistRow | undefined`, không phải `ToplistRow`. Nghe phiền
nhưng nó bắt đúng một lớp lỗi mà repo này quan tâm: file xếp hạng rỗng thì trước
đây `brands[0]` là `undefined`, hai section render ra rác, mà build vẫn xanh.

Cách xử lý: destructure rồi `throw` ngay, đừng `!` cho qua —

```ts
const [topBrand] = brands;
if (!topBrand) throw new Error(`Bang xep hang "${rankingId}" rong`);
```

KHÔNG bật `astro/tsconfigs/strictest`: nó kéo theo `exactOptionalPropertyTypes`,
mà truyền `foo={cóThểUndefined}` xuống prop `foo?:` là cách viết bình thường của
Astro — bật lên là phải rải `{...(x ? { foo: x } : {})}` khắp nơi, đổi code cho
vừa lòng type-checker chứ không sửa lỗi nào.

### `set:html` sinh HTML KHÔNG mang `data-astro-cid`

Hệ quả: rule scoped nhắm vào thẻ bên trong chuỗi `set:html` sẽ **không khớp gì cả**.

`heroTitle` của trang toplist chứa một `<span>` (từ chỉ hiện từ 768px). Viết
`.hero__title span { display: none }` thì Astro biên dịch thành
`.hero__title span[data-astro-cid-x]` — span đó là HTML thô nên không có thuộc
tính ấy, rule chết, từ này hiện luôn ở mobile và tiêu đề cao 57px thay vì 28.5px.

Cách đúng: neo `:global()` vào phần tử cha do template sinh ra —
`.hero__title :global(span)`. Cid nằm ở cha nên style vẫn không rò ra ngoài
component.

Đây là lỗi **chỉ nhìn thấy khi đo**: HTML đúng, `astro check` sạch, diff body
không thấy gì.

### `render()` phải gọi ngay tại component đặt `<Content />`

Truyền entry xuống component thì được; render sẵn ở trang rồi truyền `Content`
xuống thì **mất style**.

Astro gom style của component mà MDX import (vd `InlineCta` trong bài trang chủ)
bằng phân tích tĩnh nơi đặt `<Content />`. Truyền component factory qua props thì
nó mất dấu: bản thử làm trang chủ mất nguyên khối `<style>` 2175 ký tự, CTA hiện
trần không style. HTML vẫn đúng nên chỉ lộ khi so **CSS** của `dist/`, không lộ
khi so body.

### `prose.css` có bốn khối, cố ý không gộp

`.post__body` (bài viết), `.paragraph__content` (bài review), `.page__body`
(trang nội dung phẳng) và `.featured-article` (khối bài ở trang chủ) trông na ná nhau
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

### HTML: một `<h1>`, heading không nhảy cấp

Đã soi toàn bộ `dist/` theo 10 tiêu chí và đưa về 0 vấn đề. Hai cạm bẫy đã dính,
đừng lặp lại:

**Đừng dựng hai cây markup cho hai kích thước màn.** `HeroInner` từng có hai cây
banner với hai mốc ẩn lệch nhau 15px (bản gốc: JS đọc `clientWidth`, CSS đọc
`innerWidth`), nên ở 768-782px KHÔNG cây nào hiện — dải trắng 170px, không tiêu
đề nào, mà 768px chính là bề rộng iPad dọc. Hai cây cũng là hai `<h1>` mỗi
trang. Cách đúng: một cây, đổi ảnh và đổi nhánh chữ theo CÙNG một mốc.

**Đừng chọn cấp heading theo cỡ chữ.** `PartnerCard` từng để `<h3>` cho khẩu
hiệu quảng cáo — trang chủ có 18 chuỗi kiểu "Get 30% off Your First Order" ngay
dưới `<h1>`, còn tên brand thì không heading nào. Cỡ chữ là việc của CSS; cấp
heading là dàn ý tài liệu. Card không bắt buộc phải có heading.

Mọi class heading trong repo đã khai `font-size`/`font-weight`/`margin` tường
minh, nên đổi cấp thẻ là **0 pixel**. Thêm heading mới thì khai đủ ba thứ đó,
đừng dựa vào mặc định UA.

### `rel` của link ra ngoài khai một chỗ

`AFFILIATE_REL` và `EXTERNAL_REL` ở `lib/links.ts`. Mọi link kiếm tiền dùng
`AFFILIATE_REL` (`nofollow sponsored noopener`) — `sponsored` là token Google
chỉ định cho link trả tiền, thiếu nó là khai sai bản chất link. Trước đây chín
component tự gõ chuỗi `rel` và tất cả đều thiếu token đó.

Điều hướng luôn là `<a href>`. `ArticleLink` từng là `<div>` + `addEventListener`

- `window.open` chép từ bản gốc: không bấm được bằng bàn phím, trình đọc màn
  hình không biết là link.

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
`</svg><span>` trong `HeroToplist`) — chúng đều có comment cảnh báo tại chỗ.

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

**So body thôi là chưa đủ.** Đã có lần trang chủ mất nguyên khối `<style>` 2175
ký tự mà HTML vẫn đúng từng ký tự — chỉ lộ khi so tập khai báo CSS. Và có lần
một rule scoped chết vì `set:html` không mang `data-astro-cid`, làm tiêu đề cao
57px thay vì 28.5px mà cả `astro check` lẫn diff body đều không thấy. Với thay
đổi liên quan tới style, phải **đo bằng trình duyệt** ở 375 / 768 / 1400px.

Đổi tên class hàng loạt thì đừng dựng regex từ chuỗi trong heredoc: `\.` dễ bị
nuốt thành `.` (khớp mọi ký tự) và sửa nhầm cả code. Dùng regex viết thẳng, và
chứng minh bằng cách bỏ hết tên class khỏi `dist/` rồi so phần còn lại.

## Tài liệu

Astro: https://docs.astro.build —
[routing](https://docs.astro.build/en/guides/routing/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[images](https://docs.astro.build/en/guides/images/) ·
[styling](https://docs.astro.build/en/guides/styling/)
