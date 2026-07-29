/**
 * Path SVG dùng ở NHIỀU NƠI. Path chỉ dùng một chỗ thì để nguyên tại chỗ đó —
 * gom hết vào đây chỉ làm phải nhảy file mà không được gì.
 *
 * Đặt tên theo HÌNH DẠNG, không theo chỗ dùng: cùng một mũi tên vừa làm dấu
 * phân cách breadcrumb vừa làm mũi tên trượt ra khi hover nút CTA, nên tên
 * `FLOATING_ARROW_RIGHT` (tên cũ ở sidebar) hay `CHEVRON` (tên cũ ở breadcrumb)
 * đều chỉ đúng một nửa.
 *
 * KHÔNG bọc thành component `<Icon>`. Rất nhiều rule CSS của component cha nhắm
 * thẳng vào thẻ `svg` con — `.sidebar-partners__compare svg`,
 * `.promo-carousel__arrow svg`, `.mini-review__stars svg`, `.hero__updated svg`.
 * Đưa `<svg>` qua ranh giới component là toàn bộ những rule đó ngừng khớp.
 * Path là *dữ liệu* nên gom được; thẻ `<svg>` mang style của cha thì không.
 */

/** Mũi tên/chevron chỉ sang phải, viewBox 0 0 320 512 */
export const CHEVRON_RIGHT =
  "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z";

/**
 * Viền ngoài ngôi sao, viewBox 0 0 16 16.
 *
 * Sao nửa/rỗng ghép path này với một subpath khoét bên trong — xem
 * `lib/stars.ts`. Tách thành hai thẻ `<path>` riêng sẽ tô đầy cả hai và mất
 * hiệu ứng khoét, đây là lỗi rất dễ mắc.
 */
export const STAR_OUTLINE =
  "M16 6.204l-5.528-0.803-2.472-5.009-2.472 5.009-5.528 0.803 4 3.899-0.944 5.505 4.944-2.599 4.944 2.599-0.944-5.505 4-3.899z";

/** Dấu tích nét mảnh, viewBox 0 0 1024 1024 */
export const CHECK_THIN =
  "M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z";
