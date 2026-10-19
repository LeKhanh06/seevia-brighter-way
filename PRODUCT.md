# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Website có hai nhóm người đọc, quan trọng ngang nhau:

- **Người dùng cuối và người thân.** Người dùng chính (G1 trong tài liệu S2) là người trẻ nhìn kém (low vision) ở thành thị, đang đi học hoặc đi làm, còn thị lực chức năng và dùng thành thạo smartphone, TalkBack/VoiceOver hoặc phóng to màn hình. Việc họ cần làm hằng ngày: đọc tài liệu in, chữ trên bảng/màn hình, di chuyển trong đô thị. Nhóm phụ: người mù hoàn toàn đã qua đào tạo định hướng (G2). Trên web, họ cần hiểu kính giúp được gì và liên hệ/đăng ký quan tâm.
- **Ban giám khảo, nhà đầu tư, đối tác.** Ví dụ ban giám khảo vòng 2 AISC26 (hồ sơ AISC26-0053). Họ cần thấy rõ vấn đề, giải pháp, công nghệ và tính khả thi.

## Product Purpose

SeeVia là dự án kính trợ lý thị giác dùng AI trong hệ sinh thái kính, app và web. Dự án kết hợp thị giác máy tính, OCR và tương tác giọng nói tiếng Việt để giúp người khiếm thị và người suy giảm thị lực ở Việt Nam tiếp cận thông tin, sống tự chủ hơn và kết nối với cộng đồng. Website giới thiệu dự án (sản phẩm, công nghệ, cộng đồng, tin tức, đối tác, liên hệ) bằng hai ngôn ngữ Việt và Anh.

Website thành công khi người dùng nhìn kém đọc và dùng được trọn vẹn, và ban giám khảo, đối tác hiểu được vấn đề, giải pháp và mức độ khả thi.

## Positioning

Trợ lý thị giác đeo trên mắt, thiết kế cho người Việt: nói và hiểu tiếng Việt, ưu tiên nhóm người trẻ nhìn kém ở đô thị.

## Operating Context

- Người dùng nhìn kém đọc web bằng phóng to màn hình, chế độ tương phản cao hoặc trình đọc màn hình (TalkBack, VoiceOver), cả trên điện thoại lẫn máy tính.
- Ban giám khảo xem web cùng hồ sơ thi (kịch bản, thông tin vòng 2, user flow spec, phạm vi MVP, kiến trúc hệ thống).

## Capabilities and Constraints

- Dự án đang ở giai đoạn bản mẫu, **chưa có mô hình kính thật**. Các tình huống AI trong phần mô phỏng ở trang chủ là kịch bản viết sẵn, không dùng camera hay nhận diện thật.
- Trợ lý **SeeVia AI** (nút "Hỏi SeeVia AI") là chatbot chạy thật qua Cohere: chỉ nhận văn bản, trả lời dựa trên nội dung dự án đã duyệt, nói rõ khi thông tin chưa được xác nhận.
- Song ngữ VI | EN, chuyển ngay trên trang và ghi nhớ lựa chọn.
- Form liên hệ gửi email qua Mailgun khi backend được cấu hình; chưa có backend thì vẫn soạn và lưu bản nháp.
- Có trang chính sách riêng, hỗ trợ In/Lưu PDF.
- Công nghệ: React 19, TypeScript, Vite; backend Node.js; kiểm thử bằng Playwright.

## Brand Commitments

- Tên: **SeeVia**. Câu khẩu hiệu tiếng Anh: "See a brighter way".
- Logo mới **thay hoàn toàn** nhận diện cũ (logo chữ viết tay, màu đỏ đô và tím than). Nguồn logo và quy tắc dùng: `../logo/final/` và `../logo/final/HUONG-DAN-LOGO.md`.
  - Ý tưởng "Braille Cell Eye": ô chữ nổi 6 chấm viết chữ S, chấm đồng tử là con mắt.
  - Màu: Ink `#151515` (chính), Lemon `#FFD400` (nhấn), Cream `#FFF8D6` (nền sáng), Black `#000000` (nền tối). Không đặt logo vàng trên nền sáng.
  - Không gõ lại chữ "SeeVia" bằng font khác; luôn dùng file wordmark có sẵn.
- Font do người dùng chốt: **Nunito** cho tiêu đề và nút, **Be Vietnam Pro** cho nội dung.
- Câu "Thấy, đọc và đi — theo cách của bạn" trong bảng trình bày logo chỉ là nội dung tạm, chưa phải khẩu hiệu chính thức.

## Evidence on Hand

- Số liệu thực trạng có nguồn trong `../NỘI DUNG TỔNG HỢP.md`. Ví dụ: tỷ lệ mù hai mắt toàn quốc 4,0% (RAAB 2007); khoảng 14 triệu người Việt có suy giảm thị lực ở một mức độ nào đó (IAPB Vision Atlas 2020); người khó khăn về nhìn mức nặng có tỷ lệ việc làm 18% so với 78% (Disability Data Initiative, dữ liệu 2009).
- Tài liệu dự án: kịch bản và thông tin vòng 2 AISC26, User Flow Spec v1.0, phạm vi MVP, kiến trúc hệ thống, khả thi phần cứng (thư mục `..`).
- **Chưa có:** ảnh hoặc mô hình kính thật, lời chứng thực của người dùng, khách hàng, số liệu thử nghiệm. Không được bịa những thứ này.
- Các khía cạnh chưa có dữ liệu khoa học trong nước (tiếp cận tài liệu định dạng đặc biệt, an toàn di chuyển, tiếp cận công nghệ hỗ trợ) phải ghi là khoảng trống dữ liệu, không trích số liệu báo chí thiếu phương pháp.

## Product Principles

1. Người nhìn kém phải dùng được trước tiên: nếu một lựa chọn đẹp hơn nhưng khó đọc hơn thì bỏ.
2. Trung thực về giai đoạn: luôn nói rõ đâu là bản mẫu, kịch bản mô phỏng, đâu là chức năng chạy thật.
3. Mọi số liệu đều có nguồn; khoảng trống dữ liệu được nói thẳng.
4. Tiếng Việt là ngôn ngữ chính, tiếng Anh đầy đủ tương đương.

## Accessibility & Inclusion

- Mục tiêu WCAG 2.2 AA trở lên; chữ và thành phần chính nên đạt AAA về tương phản vì người dùng chính là người nhìn kém.
- Hỗ trợ phóng to tới 200–400% không vỡ bố cục, trình đọc màn hình, điều hướng bằng bàn phím, giảm chuyển động.
- Dấu tiếng Việt phải hiển thị đúng ở mọi font.
