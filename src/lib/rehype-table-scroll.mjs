/**
 * Bọc mỗi `<table>` do MDX render trong `<div class="prose-scroll">`.
 *
 * VÌ SAO CẦN: bảng giá rộng hơn cột nội dung ở mobile. Không có vỏ cuộn thì nó
 * hoặc bị cắt, hoặc kéo giãn cả trang — đo ở 375px: bảng 741px trong cột 334px.
 * Bản gốc xử lý đúng bằng cách này, phát ra `<div style="overflow-x:auto;width:100%">`
 * quanh TỪNG bảng, ở cả trang review lẫn bài blog, thanh cuộn để HIỆN (cao 15px).
 * `.prose-scroll` trong `styles/prose.css` khai lại đúng hai thuộc tính đó.
 *
 * VÌ SAO KHÔNG LÀM BẰNG CSS: muốn chính `<table>` cuộn được thì phải cho nó
 * `display: block`, mà như vậy là bỏ thuật toán chia cột của bảng — desktop đang
 * dựa vào `width: 100%` để chia đều. Vỏ ngoài giữ được cả hai.
 *
 * VÌ SAO KHÔNG DÙNG `unist-util-visit`: gói đó không có trong `package.json`, nó
 * chỉ tồn tại nhờ dependency nội bộ của Astro. Đi mượn là gãy lúc Astro đổi.
 * Duyệt tay hết 12 dòng.
 */
export default function rehypeTableScroll() {
  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "element" && child.tagName === "table") {
          node.children[i] = {
            type: "element",
            tagName: "div",
            properties: { className: ["prose-scroll"] },
            children: [child],
          };
        }
        /* Vẫn đi tiếp vào chính `child` (không phải vỏ vừa tạo): bảng lồng bảng
           thì hiếm, nhưng bỏ qua nhánh con là im lặng sót. */
        walk(child);
      }
    };
    walk(tree);
  };
}
