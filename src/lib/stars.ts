/**
 * Hình sao dùng chung cho vòng điểm (trang chủ) và card review.
 *
 * Sao nửa/rỗng là MỘT path gồm 2 subpath: viền ngoài + phần khoét bên trong
 * (fill-rule mặc định tạo lỗ). Tách thành 2 thẻ <path> sẽ tô đầy cả hai và mất
 * hiệu ứng — đây là lỗi rất dễ mắc.
 */
const STAR_OUTLINE =
  "M16 6.204l-5.528-0.803-2.472-5.009-2.472 5.009-5.528 0.803 4 3.899-0.944 5.505 4.944-2.599 4.944 2.599-0.944-5.505 4-3.899z";
const STAR_HALF_CUTOUT =
  "M8 11.773l-0.015 0.008 0.015-8.918 1.746 3.537 3.904 0.567-2.825 2.753 0.667 3.888-3.492-1.836z";
const STAR_EMPTY_CUTOUT =
  "M8 11.773l-3.492 1.836 0.667-3.888-2.825-2.753 3.904-0.567 1.746-3.537 1.746 3.537 3.904 0.567-2.825 2.753 0.667 3.888-3.492-1.836z";

export type StarKind = "full" | "half" | "empty";

export interface Star {
  kind: StarKind;
  d: string;
}

/** 5 ô sao: đầy → nửa (nếu dư ≥ 0.5) → còn lại rỗng */
export function starList(stars: number): Star[] {
  const full = Math.floor(stars);
  const hasHalf = stars - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return { kind: "full", d: STAR_OUTLINE };
    if (i === full && hasHalf)
      return { kind: "half", d: STAR_OUTLINE + STAR_HALF_CUTOUT };
    return { kind: "empty", d: STAR_OUTLINE + STAR_EMPTY_CUTOUT };
  });
}
