# CLAUDE.md

Hướng dẫn cho AI agent và người sửa code trong repo này.

Bối cảnh dự án, lệnh chạy và công thức thêm nội dung nằm ở
**[`README.md`](./README.md)** — đọc file đó trước. Ở đây chỉ ghi những gì **không
đọc ra được từ code**: lý do đằng sau các quyết định, và những chỗ hành xử khác
trực giác.

---

## Bộ kiểm

`astro check` chỉ kiểm **kiểu**. Hai script trong `scripts/` gánh phần còn lại:

| Script              | Kiểm gì                               | Chạy lúc          |
| ------------------- | ------------------------------------- | ----------------- |
| `check-content.mjs` | nội dung chỉ ASCII; URL trần phải bọc | `npm run check`   |
| `check-html.mjs`    | 13 luật HTML trên `dist/`             | sau `astro build` |

**`check-content.mjs`** cắt bỏ phần không render ra trang (comment, `<style>`,
`<script>`, chuỗi trong `new Error`) rồi soi phần còn lại. Nó quét cả `.ts`, vì
`config/site.ts` giữ tiêu đề và mô tả mặc định — tức là chuỗi RENDER RA TRANG.
Bỏ sót nó nên một em dash từng sống sót ở đó và ship ra 8 trang.

Luật URL trần là **điều kiện để giữ `gfm` bật**: gfm tự biến URL trần thành thẻ
`<a>`, và trên site affiliate đó là rò traffic mà không có gì báo.

**`check-html.mjs`** chạy trên `dist/` chứ không phải `src/`: "trang này có mấy
`<h1>`" chỉ trả lời được sau khi render, vì một `<h1>` có thể đến từ layout, một
cái nữa từ thân MDX. Nó nhận tham số thư mục nên soi được bản build khác:
`node scripts/check-html.mjs ../ban-cu/dist`.

13 luật: một `<h1>` mỗi trang · heading không nhảy cấp · heading không rỗng ·
không thuộc tính lỗi thời · `<button>` có `type` · `<img>` có `alt` · `alt` không
lặp chữ "image" · `<a>` có `href` · `target="_blank"` kèm `noopener` · ô nhập có
nhãn · skip link có đích · `<p>` không chứa thẻ block · `<ul>`/`<ol>` chỉ chứa `<li>`.

### Hai điều kiện để một luật đáng có script

Thiếu một trong hai thì **đừng viết** — script sai còn hại hơn không có.

1. **Người viết code KHÔNG tự thấy được vi phạm.** Ký tự vô hình thì không thấy;
   `<h1>` thứ hai do layout cộng thân MDX cũng không. Ngược lại, "file nằm sai
   thư mục" thì nhìn đường dẫn là thấy — luật đó để người giữ.
2. **Script KHÔNG chặn nhầm thay đổi hợp lệ.** Cần một bảng khai tay là sớm muộn
   bảng lạc hậu, và nó báo sai vào đúng lúc người ta đang làm kiến trúc.

Đã viết rồi bỏ hai script vì trượt điều kiện thứ hai:

- `check-structure.mjs` (component nằm đúng thư mục) — cần bảng
  `page -> loại trang`; thêm một loại trang mới là nó báo "không trang nào dùng,
  xoá đi" cho chính component của trang mới.
- `check-unused.mjs` (component/ảnh không ai dùng) — chặn việc tạm gỡ một section
  để A/B test rồi dùng lại sau, vốn là thao tác bình thường.

Hai luật đó vẫn còn hiệu lực, chỉ là do người giữ chứ không do máy.

**Viết script rồi phải kiểm ngược:** chạy nó trên bản build TRƯỚC khi sửa để chắc
nó bắt được lỗi, VÀ thử một thay đổi HỢP LỆ để chắc nó không báo sai.

### Không dùng ESLint / stylelint / husky

Đã đo, không phải đoán:

- **ESLint** + `eslint-plugin-astro` + `jsx-a11y` tìm được 3 chỗ trên 40
  component, 2 chỗ là thật (`alt="Author image"`, một `<h2>` rỗng). Chi phí:
  **+185 package** vào repo đang có 337. Đã sửa hai lỗi bằng tay rồi đưa đúng hai
  luật ấy vào `check-html.mjs` — 12 dòng, 0 dependency.
- **stylelint**: đã quét 2543 khai báo CSS, 0 rule có property trùng. Mà mọi rule
  CSS đều đã được kiểm bằng render + so `dist/`, nên property gõ sai sẽ hiện
  thành lệch pixel.
- **husky**: bắt lỗi sớm hơn `npm run build` chừng 30 giây, đổi lấy một dependency
  và một hook chạy mỗi lần commit — hook chậm thì người ta gõ `--no-verify` và nó
  thành trang trí. Khi nào có CI thì gọi `npm ci && npm run build`.

---

## Kiến trúc

Astro 7, static, **không dùng UI framework**. Mọi tương tác (popup thoát trang,
accordion, carousel, drawer mobile, tooltip, cuộn lên đầu) viết bằng `<script>`
vanilla trong chính component. Lựa chọn có chủ đích: site sống bằng traffic tìm
kiếm, và zero JS framework giúp Core Web Vitals.

### Nội dung tách khỏi code

Toàn bộ nội dung biên tập nằm trong `src/content/` dưới dạng content collection
có schema Zod. Không có mảng dữ liệu nào nằm trong `.ts` hay hardcode trong
component.

Hệ quả cho component — ranh giới nằm ở **chữ đó có đổi theo trang không**:

> Nội dung **đổi theo trang** -> truyền qua **props**. Nhãn **không đổi ở đâu cả**
> -> component **tự `getEntry`**.

`hero`, `faq`, `miniReview` và hai tiêu đề mục lớn (`bestOverallTitle`,
`miniReviewTitle`) đổi theo từng ngách nên phải là props: ngách cá sẽ là "Best
Overall Cat Food Delivery". Ngược lại `blocks/labels.yaml` (chữ nút CTA, skip
link, nhãn huy hiệu) giống hệt ở mọi trang, nên component tự lấy — xâu qua props
chỉ tạo prop drilling cho thứ không bao giờ khác.

Năm component từng tự gọi `getEntry(..., "homepage")`. Cái sai ở đó **không phải**
tự lấy, mà là tự lấy một entry **khoá theo trang**: mỗi component chỉ chạy được
cho đúng một trang, nên không thể có ngách thứ hai. Tự lấy một entry toàn site thì
không dính lỗi đó.

**Không hardcode chữ biên tập trong component.** Chữ trên nút CTA là thứ người vận
hành A/B test nhiều nhất trên site affiliate; để trong component nghĩa là đổi phải
sửa code. Ngoại lệ duy nhất hiện có: đoạn pháp lý reCAPTCHA trong `ContactCards` —
nó không phải một chuỗi mà là một câu đan bằng ba link, và cả ba href đều là
chuyện của code. Lý do ghi ngay tại chỗ.

### Mục lục thì tự lấy, tuyển chọn thì khai tay

Ba mảng id bài viết từng nằm ngay trong `lib/posts.ts` — biên tập trong code, đúng
thứ mục trên cấm. Nhưng gỡ chúng không phải một cách:

| Danh sách              | Là gì                         | Nay                               |
| ---------------------- | ----------------------------- | --------------------------------- |
| Lưới `/knowledge/`     | **mục lục** — phải đủ mọi bài | `getCollection` + sắp theo `date` |
| "Must Reads" trang chủ | **tuyển chọn** 3/6            | `blocks/curated-posts.yaml`       |
| Sidebar trang review   | **tuyển chọn** 3/6            | `blocks/curated-posts.yaml`       |

Phép thử: **danh sách đó có phải chứa mọi entry không?** Có thì đừng khai tay —
khai tay là bài thứ 7 lặng lẽ không xuất hiện, mà cũng không có gì báo. README từng
hứa "thêm bài = thêm đúng một file" trong khi lưới đọc một mảng cứng 6 phần tử;
lời hứa đó sai suốt và chỉ chưa lộ vì đủ 6/6.

Không thì khai tay là đúng, và khai bằng `reference()` để gõ sai thành lỗi build.

Hệ quả kèm theo: `date` phải là **ngày thật** (`z.coerce.date()`, ISO trong
frontmatter), không phải chuỗi hiển thị. Sáu bài từng cùng ghi `"Jan 1, 2026"` nên
không sắp xếp được và JSON-LD không phát `datePublished` nào. Hiển thị đi qua
`lib/article-date.ts`, `timeZone: "UTC"` là bắt buộc — thiếu nó thì ngày lùi một
hôm ở mọi múi giờ âm.

### Ý tưởng trung tâm: brands vs placements

Đây là chỗ dễ hiểu nhầm nhất nếu chỉ nhìn thư mục.

- **`content/brands/`** — _đối tác LÀ AI_: tên, logo, alt, link affiliate.
  Bất biến, khai một lần.
- **`content/placements/`** — _đối tác XUẤT HIỆN THẾ NÀO ở từng trang_: thứ tự,
  điểm, số sao, coupon.

Tách như vậy vì mỗi trang toplist (trang chủ và từng ngách) cùng `/reviews/` xếp
hạng **khác nhau** cho cùng một tập brand. Gộp làm một thì hoặc phải nhân đôi dữ
liệu, hoặc mất khả năng cho mỗi trang xếp một kiểu — mà đó chính là lý do tồn tại
của các ngách.

Hệ quả: đổi link affiliate là sửa **một dòng** trong `brands/`, mọi nơi đổi theo.

`src/lib/rankings.ts` nối hai thứ đó lại. `src/lib/posts.ts` làm tương tự cho bài
viết.

### Trang toplist: một file = một trang

`content/toplists/<id>.mdx` là MỘT trang toplist hoàn chỉnh. Trang chủ là entry
`home`; mọi ngách khác lấy id làm slug ở gốc site. Thân MDX là bài viết dài dưới
bảng xếp hạng; frontmatter giữ tiêu đề, hero, FAQ, mini-review.

Bốn collection cũ (`featuredArticles`, `faq`, `miniReviews`, và chữ nghĩa hero vốn
viết cứng trong component) đều chỉ có ĐÚNG MỘT entry tên `homepage` — tức đã sẵn
hình dạng "khoá theo trang", chỉ là mới có một trang. Gộp lại nên thêm một ngách
là thêm **một** file nội dung, không phải bốn.

Bảng xếp hạng thì KHÔNG gộp vào đó: nó dài 120 dòng cho 9 brand x 12 trường, và
nhịp sửa khác hẳn phần còn lại (điểm/coupon/thứ tự đổi hàng tuần, bài viết hàng
quý). Nó ở `content/placements/toplist/<id>.yaml`, nối bằng `reference()`.

**Bài kiểm nghiệm thu của mô hình này:** thêm một ngách phải chạy được với **0
dòng code**. Đã chạy thật — tạo hai file nội dung, build ra `/puppy-food/` với
cùng bộ khối, cùng thứ tự, 10 card, chỉ khác nội dung và thứ hạng. Đổi cấu trúc
gì sau này cũng phải giữ được tính chất đó.

### Quan hệ giữa collection

Dùng `reference()`, không dùng chuỗi tra bảng. Gõ sai tên brand, tác giả hay bài
viết là **lỗi build**, không phải `undefined` âm thầm lúc chạy.

### `components/` chia theo phạm vi trang phục vụ

Luật, không có chỗ nào cần phán đoán:

> Component nằm ở thư mục của loại trang duy nhất dùng nó. Dùng ở nhiều loại trang
> thì lên tầng chung gần nhất — `article/` nếu là review + blog, `layout/` nếu gần
> như mọi trang.

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
mới — và khi đó sinh ra cả cụm. Thêm loại trang = tạo một thư mục; bỏ = xoá một
thư mục.

Đo được khi chọn trục: lan truyền import từ mỗi page cho thấy **28/38 component
chỉ xuất hiện ở đúng một loại trang**, 6 cái ở gần như mọi trang, 4 cái ở đúng hai
(review + blog). Không cái nào ở giữa — nên luật trên gần như không có ca biên.

Trục CŨ (`sections/` `sidebar/` `ui/` `brand/`) cắt theo bốn thứ khác nhau cùng
lúc, và vị trí là thuộc tính của CÁCH DÙNG chứ không phải của component: dời một
khối từ sidebar vào thân bài là nó sai thư mục dù bản thân nó không đổi gì.

### Routing

| Route                          | Sinh từ                  |
| ------------------------------ | ------------------------ |
| `pages/[...toplist].astro`     | `content/toplists/*.mdx` |
| `pages/reviews/[slug].astro`   | `content/reviews/*.mdx`  |
| `pages/knowledge/[slug].astro` | `content/posts/*.mdx`    |
| `pages/[page].astro`           | `content/pages/*.mdx`    |

`[...toplist].astro` là route **rest**, sinh cả `/` lẫn mọi ngách ở gốc site.
Entry `home` cho ra param `undefined` -> URL `/`, nên trang chủ và mọi ngách dùng
CHUNG một khuôn, không có `index.astro` riêng. Route rest xếp hạng thấp hơn route
động có tên nên nó KHÔNG nuốt `[page].astro` — đã kiểm bằng build.

Ràng buộc id: `home` dành riêng cho trang chủ; id trong `toplists/` không được
trùng id trong `pages/`, và không được là `contact`, `reviews`, `knowledge`.

Slug **là** id của entry (tên file) — không khai `slug` trong frontmatter. Hai
nguồn sự thật cho URL từng gây ra một URL sai chính tả trong dự án này.

Mọi URL nội bộ dựng qua **`src/lib/links.ts`**. Đừng gõ tay đường dẫn trong
component.

### `layouts/` chỉ chứa thứ bọc trang khác

Phép thử: một file thuộc về `layouts/` khi nó có **`<slot />`**. Không có slot thì
nó không bọc ai — nó _là_ thân của một trang, và chỗ của nó là `pages/`.

Đúng hai file, xếp hai tầng, ranh giới là **tài liệu** so với **khung nhìn thấy được**:

|         | `BaseLayout`                                                      | `InnerPageLayout`                                             |
| ------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Phát ra | `<html>` · `<head>` · Seo · skip link · `global.css`              | Header · HeroInner · Breadcrumbs · Footer · ToTop             |
| Props   | metadata: `title` `description` `image` `type` `noindex` `schema` | `heroTitle` `heroMobileTitle` `heroAlt` `isTitleTop` `crumbs` |

`InnerPageLayout` chuyển thẳng 6 props metadata xuống dưới. Ngoại lệ DUY NHẤT là
`schema`: layout đã nhận `crumbs` để vẽ breadcrumb nhìn thấy được, nên nó **tự
dựng `BreadcrumbList`** từ đúng dữ liệu ấy rồi ghép vào `schema` của trang. Để
từng trang tự truyền thì vừa lặp vừa dễ quên — `/contact/`, `/reviews/` và
`/knowledge/` từng hiện breadcrumb mà không phát JSON-LD nào.

Cần cả hai tầng vì trang chủ dùng riêng `BaseLayout`: nó không có breadcrumb,
banner là `HeroToplist` với cây DOM khác hẳn, `<main>` bọc luôn banner, và chỉ nó
có `ExitPopup`. Gộp một tầng thì trang chủ phải tắt từng thứ bằng
`showBreadcrumbs={false}` — prop trình bày trá hình, đúng thứ quy ước cấm.

**Ngưỡng cho prop bật/tắt khung.** Một prop tắt MỘT mảnh khung là chấp nhận được — cái giá
của việc không dùng nó là trang đó tự dựng lại cả Header/`<main>`/Footer, tức quay về đúng
chỗ lặp mà layout sinh ra để gỡ. Nhưng **từ BA mảnh khác nhau trở lên thì trang đó không
thuộc layout này nữa**: cho nó dùng thẳng `BaseLayout`.

Đây là ngưỡng, không phải nguyên tắc sạch — thêm một prop bao giờ cũng dễ hơn nhận ra layout
đã hết vừa, nên nó là chỗ dễ trôi nhất khi thêm loại trang mới.

Trang chủ lệch tới BỐN mảnh (`HeroToplist` thay `HeroInner`, không breadcrumb, `<main>` bọc
luôn banner, có `ExitPopup`) nên nó ở phía trên ngưỡng — dùng thẳng `BaseLayout` là đúng.

`InnerPageLayout` **không phát `<main>`**: trang review và bài blog đặt `<main>`
bên trong lưới ba cột, bọc sẵn sẽ thành `<main>` lồng `<main>`. Mỗi page tự viết
`<main id="main-content">` — id đó là đích của skip link, `check-html` canh.

Lưới ba cột đó là `components/article/ArticleGrid.astro` — component, không phải
layout, vì nó là một khối bố cục chứ không phải vỏ trang (cùng lý do `ContentGrid`
của trang chủ nằm ở `components/`). Nó có ba slot **có tên**
(`nav` / `main` / `sidebar`) nên thứ tự cột do nó quyết; và cố ý **không** khai
`grid-template-areas`, vì trước đây cả hai trang đều khai mà không con nào nhận
`grid-area` — thứ xếp cột thật luôn là auto-placement theo thứ tự DOM.

### Style

| File                | Vai trò                                                  |
| ------------------- | -------------------------------------------------------- |
| `styles/tokens.css` | 18 token đặt theo VAI TRÒ                                |
| `styles/global.css` | `@font-face`, reset, `@import` tokens + prose            |
| `styles/prose.css`  | Style thân bài do MDX render — BỐN khối, cố ý không gộp  |
| `styles/hero.css`   | Khung banner dùng chung của `HeroToplist` và `HeroInner` |

Ngoài ra mỗi component tự giữ style trong `<style>` scoped của nó.

`hero.css` **không** được `global.css` import — hai component hero tự
`import "@/styles/hero.css"`. Nó là file global vì hai component render cùng bộ
class khung, mà scoped style không xuyên qua ranh giới component; chép vào cả hai
file là tạo lại đúng thứ trùng lặp vừa gỡ. Rule ở đó là class trần (0,1,0) nên
luôn thua rule scoped (0,2,0) của từng nhánh: khung là nền, nhánh đè lên.

Bốn khối của `prose.css`: `.post__body` (bài blog) · `.paragraph__content` (bài
review) · `.page__body` (4 trang phẳng) · `.featured-article` (khối bài ở trang
toplist). Đầu file ghi rõ vì sao **không gộp được** — đọc trước khi định dọn.

`tokens.css` ghi sẵn quy tắc để một giá trị thành token: **dùng >=3 chỗ VÀ mọi chỗ
cùng một vai trò**. Vì vậy có ba token cùng `#ffffff` (`--color-bg`,
`--color-surface`, `--color-text-on-primary`) — cố ý, đừng "dọn" thành một.
`--width-content` (1060px) là bề rộng cột nội dung của cả site; trước đây viết
cứng ở 17 chỗ trên 16 file với ba biến thể không ai bảo đảm còn khớp.

---

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
- Tên file asset **không lặp lại tên thư mục**: `hero/desktop.jpg`, không phải
  `hero/hero.jpg`; `contact/help.png`, không phải `contact/contact-help.png`

**CSS**

- BEM `block__element--modifier`, kebab-case. Block khớp tên component.
- Custom property đặt theo **vai trò**, không theo giá trị — `--color-primary`,
  không phải `--color-orange`

**Nội dung**

- Trường frontmatter `camelCase`, khớp schema Zod
- Quan hệ giữa collection dùng `reference()`

---

## Quy ước commit

Viết bằng **tiếng Việt**, ngắn gọn. Dạng `type(scope): mô tả` — `scope` không bắt buộc.

`feat` · `fix` · `refactor` · `style` · `perf` · `docs` · `test` · `build` ·
`chore` (đúng bộ conventional commits, không chế thêm).

Thêm `scope` khi phạm vi rõ ràng, bỏ khi thay đổi trải rộng nhiều phần.

```
feat(toplist): thêm huy hiệu giảm giá cho card hạng 1
fix(header): drawer mobile không đóng khi bấm overlay
refactor: gom logic dựng URL về lib/links.ts
```

Không thêm dòng `Co-Authored-By`.

---

## Những điều dễ vấp

Không phải điều cấm — chỉ là những chỗ hành xử khác trực giác. Biết trước thì đỡ
mất thời gian truy nguyên.

### `rem` co theo breakpoint

`global.css` đặt `html { font-size: 14px }` và đổi thành `16px` từ `1025px`.
**Mọi giá trị `rem` trong site đều đi qua đây** — một component trông đúng ở
desktop có thể lệch ở mobile chỉ vì điều này. Đổi hai con số đó là đổi tỉ lệ toàn
site.

### `body { line-height: 1.7em }` dùng `em`, không phải unitless

`em` được tính **một lần** trên `body` rồi kế thừa xuống dưới dạng px cố định.
Unitless (`1.7`) sẽ tính lại trên từng element theo font-size riêng của nó. Hai
cách cho kết quả khác nhau ở mọi element có font-size khác body.

### Scoped style không xuyên qua ranh giới component

Astro chỉ áp scoped style cho element nằm trong template của **chính** component
đó. Tách một phần markup ra component con thì mọi rule của cha nhắm tới phần đó sẽ
ngừng khớp. Muốn tách component lớn (`PartnerCard` 862 dòng, `MiniReview` 571) thì
phải chuyển style theo, hoặc dùng `:global()`.

Cùng lý do: nội dung đưa vào qua `<slot />` hoặc do MDX render nằm **ngoài** phạm
vi scoped. Đó là vì sao style thân bài sống ở `styles/prose.css` chứ không nằm
trong `<style>` của component render nó.

### `set:html` sinh HTML KHÔNG mang `data-astro-cid`

Hệ quả: rule scoped nhắm vào thẻ bên trong chuỗi `set:html` **không khớp gì cả**.

`heroTitle` của trang toplist chứa một `<span>` (từ chỉ hiện từ 768px). Viết
`.hero__title span { display: none }` thì Astro biên dịch thành
`.hero__title span[data-astro-cid-x]` — span đó là HTML thô nên không có thuộc
tính ấy, rule chết, từ này hiện luôn ở mobile và tiêu đề cao 57px thay vì 28.5px.

Cách đúng: neo `:global()` vào phần tử cha do template sinh ra —
`.hero__title :global(span)`. Cid nằm ở cha nên style vẫn không rò ra ngoài.

Đây là lỗi **chỉ nhìn thấy khi đo**: HTML đúng, `astro check` sạch, diff body
không thấy gì.

### `render()` phải gọi ngay tại component đặt `<Content />`

Truyền entry xuống component thì được; render sẵn ở trang rồi truyền `Content`
xuống thì **mất style**.

Astro gom style của component mà MDX import (vd `InlineCta`) bằng phân tích tĩnh
nơi đặt `<Content />`. Truyền component factory qua props thì nó mất dấu: bản thử
làm trang chủ mất nguyên khối `<style>` 2175 ký tự, CTA hiện trần không style.
HTML vẫn đúng nên chỉ lộ khi so **CSS** của `dist/`.

### Hero: `<picture>` chứ không phải hai `<img>` ẩn/hiện

Ảnh `display: none` **vẫn được trình duyệt tải**. Hai `<Image>` desktop/mobile ẩn
nhau bằng CSS nghĩa là mọi trang tải cả hai, và cả hai đều `loading="eager"` nên
chúng tranh băng thông trên đường tới LCP. Đo được: `/about/` từ 95.2 KB xuống
63.6 KB, trang chủ giảm 31.5 KB, toàn site 21 trang giảm 14%.

Astro **không có** component làm art direction — `<Picture>` chỉ đổi ĐỊNH DẠNG của
cùng một ảnh. Dựng tay bằng `getImage()` rồi ghép `<picture>` + `<source media>`;
vẫn được srcset tối ưu.

Ba điều phải nhớ khi sửa hero:

1. **`<picture>` phải `position: absolute; inset: 0`**, KHÔNG dùng
   `display: contents`. `.hero__banner` là grid, nên `display: contents` đưa
   `<img>` lên làm grid item và sinh thêm một hàng — đo được `grid-template-rows`
   thành `54.72px 117.28px`, đẩy tiêu đề xuống 54.7px và làm mất tác dụng của
   `--top` ở trang `/about/`.
2. **Chỉ còn MỘT `alt`.** Bản gốc có chuỗi alt riêng cho mobile ở vài trang; nay
   dùng chuỗi desktop cho cả hai vì `<picture>` chỉ có một `<img>`.
3. **`object-position` phải đổi theo cùng mốc** mà `<source media>` dùng. Trang
   chủ căn ảnh mobile giữa dọc, ảnh desktop mép trên.

### HTML: một `<h1>`, heading đúng cấp

Hai bài học đắt, `check-html` giờ canh cả hai.

**Đừng dựng hai cây markup cho hai kích thước màn.** `HeroInner` từng có hai cây
banner với hai mốc ẩn lệch nhau 15px (bản gốc: JS đọc `clientWidth`, CSS đọc
`innerWidth`), nên ở 768-782px KHÔNG cây nào hiện — dải trắng 170px, không tiêu đề
nào, mà 768px chính là bề rộng iPad dọc. Hai cây cũng là hai `<h1>` mỗi trang.

**Đừng chọn cấp heading theo cỡ chữ.** `PartnerCard` từng để `<h3>` cho khẩu hiệu
quảng cáo — trang chủ có 18 chuỗi kiểu "Get 30% off Your First Order" ngay dưới
`<h1>`, còn tên brand thì không heading nào. Cỡ chữ là việc của CSS; cấp heading là
dàn ý tài liệu. Card không bắt buộc phải có heading.

Mọi class heading trong repo đã khai `font-size`/`font-weight`/`margin` tường minh,
nên đổi cấp thẻ là **0 pixel**. Thêm heading mới thì khai đủ ba thứ đó.

### `rel` của link ra ngoài khai một chỗ

`AFFILIATE_REL` và `EXTERNAL_REL` ở `lib/links.ts`. Mọi link kiếm tiền dùng
`AFFILIATE_REL` (`nofollow sponsored noopener`) — `sponsored` là token Google chỉ
định cho link trả tiền, thiếu nó là khai sai bản chất link. Trước đây chín
component tự gõ chuỗi `rel` và tất cả đều thiếu token đó.

Điều hướng luôn là `<a href>`. `ArticleLink` từng là `<div>` gắn
`addEventListener` rồi gọi `window.open`, chép từ bản gốc — không bấm được bằng
bàn phím, và trình đọc màn hình không biết đó là link.

### Font qua `astro:fonts`, KHÔNG tự khai `@font-face`

Lý do chính là **`optimizedFallbacks`** (mặc định bật): Astro dùng capsize sinh
`size-adjust` / `ascent-override` cho font dự phòng, nên lúc `font-display: swap` đổi font
thì chữ **không nhảy** — và nó không tốn byte mạng nào vì dùng font có sẵn trong máy, khác
với `preload` vốn giành băng thông với ảnh LCP.

Hai provider, mỗi cái có lý do **đo được**:

| Font    | Provider   | Vì sao                                                                                                                                                                                              |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lato    | `local()`  | File trong repo đã **gỡ hinting** (thiếu `cvt `, `fpgm`, `prep`) nên nhỏ hơn bản Google 40%: 13.7 so với 23.0 KB, mà đường nét vẽ Y HỆT (so 24 chữ mẫu: 0 khác), cùng 215 ký tự, cùng version 1.104 |
| Poppins | `google()` | Đã so SHA-256: hai file cũ **trùng từng byte** với bản Google Fonts, nên tải về giống hệt mà bỏ được file khỏi repo                                                                                 |

`google()` tải lúc **BUILD** rồi tự host ở `dist/_astro/fonts/` — trình duyệt người đọc
không gọi ra Google. Khác hẳn nhúng `<link href="fonts.googleapis.com">`.

**`<Font>` đặt ở đâu là quan trọng.** Lato ở `BaseLayout` (mọi trang dùng). Poppins đặt
**trong chính `ExitPopup.astro`** vì nó chỉ dùng ở 1/21 trang — để ở `BaseLayout` là 20
trang còn lại phải mang theo `@font-face` thừa. Bản cũ cũng làm vậy, chỉ khác là viết
`@font-face` tay ngay trong `<style>` của component. Đã kiểm bản build: trang chủ 5 face,
trang khác 3.

**CỐ Ý không bật `preload`** — `<Font preload>` preload MỌI biến thể của family.

`cssVariable` đặt đúng tên token repo dùng (`--font-brand`), nên component không phải sửa.
**Đừng khai lại `--font-brand` trong `tokens.css`** — khai lại là đè mất tên font dự phòng
và fallback hết tác dụng.

### `og:image` mặc định ở `public/`, không phải `src/assets/`

`public/og-image.jpg` (1200x630) là ảnh chia sẻ cho mọi trang không tự truyền
`image`. Đường dẫn khai ở `SITE.ogImage` trong `config/site.ts`.

Astro **băm tên file** trong `src/assets/`, nên mỗi lần đổi ảnh là URL đổi theo —
mà Facebook/Twitter/Zalo **cache URL này**. Link đã chia sẻ sẽ mất ảnh. `public/`
giữ nguyên đường dẫn.

`og:image:width`/`height` CHỈ khai khi dùng ảnh mặc định: bài blog truyền ảnh card
riêng mà `Seo.astro` không biết kích thước — khai sai còn tệ hơn không khai.

Ảnh hiện tại là ảnh **tạm**. Thay bằng cách ghi đè file, không cần sửa code.

### `tsconfig` bật `noUncheckedIndexedAccess`

`brands[0]` có kiểu `ToplistRow | undefined`. Nghe phiền nhưng nó bắt đúng một lớp
lỗi repo này quan tâm: file xếp hạng rỗng thì `brands[0]` là `undefined`, hai
section render ra rác mà build vẫn xanh.

Cách xử lý: destructure rồi `throw` ngay, đừng `!` cho qua —

```ts
const [topBrand] = brands;
if (!topBrand) throw new Error(`Bang xep hang "${rankingId}" rong`);
```

KHÔNG bật `astro/tsconfigs/strictest`: nó kéo theo `exactOptionalPropertyTypes`, mà
truyền `foo={cóThểUndefined}` xuống prop `foo?:` là cách viết bình thường của
Astro — bật lên là phải rải `{...(x ? { foo: x } : {})}` khắp nơi, đổi code cho vừa
lòng type-checker chứ không sửa lỗi nào.

### `astro.config.mjs`: 5 khoá, 3 import

Nguyên tắc: **ưu tiên mặc định của Astro.** Chỉ khai một khoá khi giá trị muốn dùng
khác mặc định — khai lại đúng mặc định là rác.

`smartypants: false` truyền cho `mdx()` là **bắt buộc**, không phải trang trí:
`@astrojs/mdx` có mặc định RIÊNG là BẬT, nên bỏ khoá này thì build đổi nháy thẳng
thành nháy cong. Đã đo: sinh 234 ký tự cong trong `dist/` mà nguồn vẫn ASCII, nên
nhìn source không thấy gì.

Khai ở `mdx()` chứ **không** qua `markdown.processor: satteri(...)`: cách kia phải
import `@astrojs/markdown-satteri`, mà gói đó không có trong `package.json` — nó
chỉ tồn tại vì `astro` phụ thuộc nó. Import gói mình không khai là chạy nhờ.

### Tên file asset nằm trong URL

Astro phát ảnh thành `/_astro/<basename>.<hash>.<ext>` — **basename là tên file
gốc**. Dời thư mục không ảnh hưởng URL, nhưng đổi tên file thì có.

### `image()` trong schema phát cả file gốc

Ảnh khai bằng `image()` luôn được phát bản gốc bên cạnh bản `.webp` mà `<Image>`
sinh ra, vì `ImageMetadata.src` phải trỏ tới file có thật. Nếu markup chỉ dùng
`<Image>`, bản gốc nằm trong `dist/` mà không trang nào tham chiếu (~136 KB / 8
file hiện tại). Không ảnh hưởng người dùng, chỉ là dung lượng deploy.

### Prettier format `.astro`, KHÔNG format `src/content/**`

Cấu hình **giống hệt `bestaibuilders`** — cùng `.prettierrc.json`, cùng
`.prettierignore`. Chỉ đúng một khoá lệch mặc định:

```json
{ "printWidth": 100, "plugins": ["prettier-plugin-astro"] }
```

**Nháy đôi** cho code, tức mặc định của prettier, nên không khai `singleQuote`.
Cũng không khai `overrides` gán parser `astro` — đã đo, output giống hệt từng byte
có hay không có nó, vì `prettier-plugin-astro` tự nhận đuôi file. Và không khai
`public/` trong ignore: prettier không nhận `.svg` / `.txt` / `.jpg` nên dòng đó
không làm gì.

`src/content/**` không format vì Markdown nhạy cảm với khoảng trắng — thụt lề quyết
định danh sách lồng, dòng trống quyết định loose/tight (và nhịp dọc giữa các mục
theo đó mà đổi). File `.yaml` nội dung cũng nằm ngoài: chuỗi biên tập, chỉnh tay.

Vài chỗ trong template cố ý viết sát nhau, không có khoảng trắng (vd
`</svg><span>` trong `HeroToplist`) — chúng đều có comment cảnh báo tại chỗ.

**`core.autocrlf = true` trên máy này**, nên `prettier --check` báo mọi file chưa
được format lại kể từ lần checkout — đó là CRLF, không phải lỗi định dạng. Muốn
biết lỗi thật thì bỏ `\r\n` trước khi so: lần gần nhất 22 file bị báo nhưng chỉ 4
file lệch thật.

---

## Nội dung đến từ nguồn ngoài

Nội dung ban đầu nhập từ một site có sẵn. Phần lớn dấu vết đã dọn, ghi lại đây để
biết chúng từng tồn tại và vì sao không còn:

| Dấu vết                                                           | Đã xử lý                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Dấu cách đôi/cuối trong `alt` và tên brand                        | bỏ — dữ liệu giữ TÊN, template và CSS giữ KHOẢNG CÁCH      |
| `<p>&nbsp;</p>` và dòng `&nbsp;` làm spacer                       | bỏ — thay bằng `margin` trong `prose.css`                  |
| `<h2></h2>` rỗng làm khoảng cách sau ảnh                          | bỏ — đo được 0 pixel, chúng chỉ là mục vô danh trong dàn ý |
| Trang `terms-of-use` không có heading, danh sách dựng bằng `<br>` | `<h2>` + `<ul>`/`<ol>` thật, CSS giữ nguyên hình           |
| 54 `style={{...}}` vẽ viền trên từng `<td>`                       | gom về `prose.css`                                         |
| Nháy cong, em dash, ellipsis, ký tự chấm tròn                     | ASCII; `check-content.mjs` giữ cho không trôi lại          |

Còn lại, **cố ý giữ**:

- Một brand có tới **năm biến thể tên** (`name`, `logoAlt`, `logoAltShort`,
  `sidebarName`, `articleLinkName`) vì nguồn dùng chuỗi khác nhau ở từng vị trí.
  Đây là dữ liệu thật, không phải trùng lặp.
- `--font-ui` khai `"Work Sans"` mà không nạp font đó — tái tạo có chủ ý lỗi của
  bản gốc.
- Trang chủ và `/reviews/` xếp hạng khác nhau cho cùng một brand.

---

## Khi thay đổi ảnh hưởng giao diện

`astro check` chỉ kiểm kiểu — nó **không** phát hiện được lỗi giao diện. Một prop
đổi tên mà quên phần destructure vẫn qua `astro check` sạch trong khi cả trang
render sai biến thể.

Với thay đổi đụng vào CSS, layout hay tên prop: dựng site trước/sau rồi so `dist/`
— bỏ qua `data-astro-cid-*` và hash trong `/_astro/`, vì hai thứ đó đổi mỗi khi
file component đổi đường dẫn.

**So body thôi là chưa đủ.** Đã có lần trang chủ mất nguyên khối `<style>` 2175 ký
tự mà HTML vẫn đúng từng ký tự — chỉ lộ khi so tập khai báo CSS. Và có lần một rule
scoped chết vì `set:html`, làm tiêu đề cao 57px thay vì 28.5px mà cả `astro check`
lẫn diff body đều không thấy. Với thay đổi liên quan tới style, phải **đo bằng
trình duyệt** ở 375 / 768 / 1400px.

**Chờ layout ổn định trước khi đo.** Ảnh lazy dưới màn làm chiều cao tài liệu lệch
~20px nếu đo quá sớm — đã tưởng là hồi quy thật một lần.

Đổi tên class hàng loạt thì đừng dựng regex từ chuỗi trong heredoc: `\.` dễ bị nuốt
thành `.` (khớp mọi ký tự) và sửa nhầm cả code. Dùng regex viết thẳng, và chứng
minh bằng cách bỏ hết tên class khỏi `dist/` rồi so phần còn lại.

**Tương tác phải thử tay hoặc bằng Playwright** — không script nào canh chúng:
drawer mobile, menu con Reviews, accordion FAQ, drawer Summary ở MiniReview,
carousel sidebar review, popup thoát trang, tooltip đối tác, vòng điểm chạy số,
modal liên hệ, nút lên đầu trang.

---

## Tài liệu

Astro: https://docs.astro.build —
[routing](https://docs.astro.build/en/guides/routing/) ·
[content collections](https://docs.astro.build/en/guides/content-collections/) ·
[images](https://docs.astro.build/en/guides/images/) ·
[styling](https://docs.astro.build/en/guides/styling/)
