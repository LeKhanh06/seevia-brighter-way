# Chỉ số Admin Dashboard

Bảng này sinh từ `js/i18n/vi.js` (cùng nguồn chữ với tooltip trên giao diện) để backend và giao diện dùng chung một định nghĩa.
Đơn vị trong API: thời lượng **giây** (`*_seconds`), độ trễ **mili giây** (`*_ms`), tỷ lệ **phần trăm 0–100**. Định dạng hiển thị (vi-VN) do frontend làm.
Chi tiết hình dạng JSON: `docs/API_CONTRACT.md`.

| Tên hiển thị | Trường API | Đơn vị | Cách tính | Tác dụng | Trang |
|---|---|---|---|---|---|
| Lượt sử dụng | `totals.uses` | lượt | Một lần chủ kính gọi một chức năng và đi đến kết cục cuối: hoàn thành, thất bại, hủy, không xác nhận hoặc bỏ cuộc. Không tính nhấn dưới 0,3 giây, âm báo tự phát và các bước trung gian. | Cho biết mức độ sử dụng SeeVia của toàn hệ thống. | Tổng quan |
| Chủ kính hoạt động | `totals.active_owners` | chủ kính | Số tài khoản không trùng có ít nhất 1 lượt sử dụng trong kỳ. | Cho biết có bao nhiêu chủ kính thực sự dùng SeeVia. | Tổng quan |
| Tỷ lệ hoàn thành | `totals.completion_rate` | % (0–100) | Số tác vụ hoàn thành chia tổng số tác vụ. | Cho biết SeeVia tự làm xong việc cho người dùng ở mức nào. | Tổng quan |
| Thời gian sử dụng | `totals.usage_seconds` | giây | Tổng thời lượng các lượt cộng phút phiên live và cuộc gọi; phần trùng nhau chỉ tính một lần. Dưới 60 phút hiện “x phút”, từ 60 phút hiện “x giờ y phút”. | Cho biết người dùng dành bao nhiêu thời gian với SeeVia, không phải thời gian đeo kính. | Tổng quan |
| TB mỗi chủ kính | `totals.usage_seconds_per_owner` | giây | Tổng thời gian sử dụng chia số chủ kính hoạt động. | Cho biết mức dùng của một chủ kính điển hình. | Tổng quan |
| Lượt sử dụng | `summary.uses, summary.share_of_total_pct` | lượt, % | Số lượt của nhóm chức năng; phần trăm là tỷ lệ trên tổng lượt toàn hệ thống. | Cho biết nhóm chức năng này được dùng nhiều đến đâu. | Đọc & Nhận diện, Tìm & Hiểu, Kết nối, Di chuyển |
| Hoàn thành | `summary.completion_rate` | % | Số tác vụ trong nhóm hoàn thành chia tổng số tác vụ của nhóm. | Cho biết chức năng nào hay dở dang. | Đọc & Nhận diện, Tìm & Hiểu, Kết nối |
| Thời gian sử dụng | `summary.usage_seconds` | giây | Tổng thời lượng các lượt cộng phút phiên live và cuộc gọi; phần trùng nhau chỉ tính một lần. Dưới 60 phút hiện “x phút”, từ 60 phút hiện “x giờ y phút”. | Cho biết người dùng dành bao nhiêu thời gian với SeeVia, không phải thời gian đeo kính. | Đọc & Nhận diện, Tìm & Hiểu, Kết nối |
| Thời gian bật cảnh báo vật cản | `summary.alert_mode_seconds` | giây | Tổng thời gian chế độ cảnh báo vật cản được bật, cộng dồn các lần bật. | Cho biết chế độ này được dùng bao lâu. | Di chuyển |
| Số cảnh báo mỗi giờ | `summary.alerts_per_hour` | số cảnh báo / giờ | Tổng số cảnh báo chia tổng số giờ bật. | Chỉ cho biết tần suất, không cho biết cảnh báo đúng hay sai. | Di chuyển |
| Lượt sử dụng | `features[].uses (+ uses_unit)` | lượt / phiên / cuộc / lần bật | Số lượt dùng chức năng trong kỳ; phiên, cuộc gọi hoặc lần bật được ghi kèm đơn vị. | So sánh mức dùng giữa các chức năng. | 4 trang chức năng |
| Hoàn thành | `features[].completion_rate` | % | Số tác vụ hoàn thành chia tổng số tác vụ. Dấu — nghĩa là chức năng không tính hoàn thành theo lượt. | Phát hiện chức năng hay dở dang. | 4 trang chức năng |
| Chờ nghe tiếng đầu | `features[].first_audio_p50_ms` | mili giây | Mức chờ mà 50% lượt không vượt quá (p50), từ lúc nhả nút đến tiếng đầu tiên. | Đo tốc độ phản hồi. | 4 trang chức năng |
| Lỗi | `features[].errors` | lượt | Số lượt gặp lỗi kỹ thuật có mã lỗi, đếm trên lượt ghi nhận. | Phát hiện chức năng hay lỗi. | 4 trang chức năng |
| Ảnh bị từ chối | `features[].details.rejected_images` | lượt | Số ảnh bị từ chối vì quá mờ hoặc quá tối, kính nhắc chụp lại. | Cho biết chất lượng ảnh người dùng chụp. | Chi tiết từng chức năng (4 trang chức năng) |
| Thử lại TB | `features[].details.avg_retries` | lần | Trung bình số lần thử lại một tác vụ, đếm trên lượt ghi nhận. | Cho biết mức khó dùng. | Chi tiết từng chức năng (4 trang chức năng) |
| Xử lý thường mất | `features[].details.processing_p50_seconds` | giây | p50: thời gian xử lý ảnh mà 50% lượt không vượt quá. | Đo tốc độ xử lý. | Chi tiết từng chức năng (4 trang chức năng) |
| Căn khung thường mất | `features[].details.framing_p50_seconds` | giây | p50: thời gian căn khung chữ vào đúng vị trí mà 50% phiên không vượt quá. | Đo độ khó khi căn khung. | Chi tiết từng chức năng (4 trang chức năng) |
| Phiên TB | `features[].details.avg_session_seconds` | giây | Thời lượng trung bình của một phiên đọc chữ live. | Cho biết người dùng đọc live bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Chưa chắc chắn | `features[].details.uncertain_rate_pct` | % | Số lần kính chưa chắc chắn về mệnh giá (uncertain) chia số lượt nhận tiền. | Cho biết độ tin cậy khi nhận tiền. | Chi tiết từng chức năng (4 trang chức năng) |
| Thường kéo dài | `features[].details.duration_p50_seconds` | giây | p50: thời lượng một lượt mà 50% lượt không vượt quá. | Cho biết một lượt mất bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Tỷ lệ cần tra web | `features[].details.web_lookup_rate_pct` | % | Số lượt trò chuyện cần tra web chia tổng số lượt trò chuyện. | Cho biết nhu cầu thông tin ngoài. | Chi tiết từng chức năng (4 trang chức năng) |
| Hủy trong cửa sổ | `features[].details.cancel_in_window_pct` | % | Số lượt bị hủy trong thời gian cho phép hủy chia tổng số lượt. | Phát hiện gọi hoặc nhắn nhầm. | Chi tiết từng chức năng (4 trang chức năng) |
| Hỏi lại | `features[].details.reask_pct` | % | Số lượt kính phải hỏi lại người dùng chia tổng số lượt. | Cho biết kính nghe rõ đến đâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Đến khi xác nhận (thường) | `features[].details.confirm_p50_seconds` | giây | p50: thời gian từ lúc yêu cầu đến khi người dùng xác nhận. | Đo độ nhanh của bước xác nhận. | Chi tiết từng chức năng (4 trang chức năng) |
| Nghe máy | `features[].details.answer_rate_pct` | % | Số cuộc gọi Internet được nghe máy chia tổng số cuộc gọi (đi và đến). | Cho biết cuộc gọi có kết nối được không. | Chi tiết từng chức năng (4 trang chức năng) |
| Thời lượng TB | `features[].details.avg_call_seconds` | giây | Thời lượng trung bình của một cuộc gọi Internet. | Cho biết cuộc gọi kéo dài bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Lỗi kết nối | `features[].details.connection_errors` | lượt | Số cuộc gọi bị lỗi kết nối. | Phát hiện vấn đề mạng khi gọi. | Chi tiết từng chức năng (4 trang chức năng) |
| Thời lượng TB | `features[].details.avg_play_seconds` | giây | Thời lượng nghe nhạc trung bình mỗi lượt. | Cho biết người dùng nghe nhạc bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Mỗi lần dẫn đường trung bình | `features[].details.avg_trip_seconds` | giây | Thời gian trung bình của một lần dẫn đường. | Cho biết một chuyến đi dài bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Mỗi lần đặt xe trung bình | `features[].details.avg_booking_seconds` | giây | Thời gian trung bình để hoàn tất một lần đặt xe. | Cho biết đặt xe mất bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Người dùng hủy giữa chừng | `features[].details.cancel_midway_pct` | % | Số lượt người dùng hủy khi đang thực hiện chia tổng số lượt. | Phát hiện chỗ người dùng bỏ dở. | Chi tiết từng chức năng (4 trang chức năng) |
| Tỷ lệ hủy | `features[].details.cancel_rate_pct` | % | Số lượt bị hủy chia tổng số lượt. | Cho biết nhạc có bị hủy nhiều không. | Chi tiết từng chức năng (4 trang chức năng) |
| Tổng thời gian bật | `features[].details.total_on_seconds` | giây | Tổng thời gian chế độ được bật, cộng dồn các lần bật. | Cho biết chế độ này được dùng bao lâu. | Chi tiết từng chức năng (4 trang chức năng) |
| Tỷ lệ cài đặt kính thành công | `install_success_rate (+ install_attempts, install_successes, install_errors[])` | % | Số lần cài đặt đến khi kính báo “Glasses Online” chia số lần bắt đầu cài đặt. Lỗi theo mã: mạng 5 GHz, không tìm thấy kính, yêu cầu liên kết hết hạn. | Cho biết bước cài đặt kính có khó với người dùng không. | Cộng đồng & Thiết bị |
| Thời gian cài đặt kính | `install_p50_seconds` | giây | Số phút từ lúc bắt đầu cài đặt đến khi kính báo “SeeVia đã sẵn sàng”. p50 là mức mà 50% lượt cài đặt không vượt quá. | Cho biết cài đặt mất bao lâu. | Cộng đồng & Thiết bị |
| Tài khoản có liên hệ khẩn cấp | `emergency_contact_accounts, total_accounts` | tài khoản | Số tài khoản có ít nhất 1 liên hệ khẩn cấp chia TỔNG SỐ TÀI KHOẢN. Chỉ đếm có hoặc không, không hiển thị tên hay số điện thoại. | Đánh giá mức sẵn sàng của luồng SOS. | Cộng đồng & Thiết bị |
| Mất kết nối / ngày | `disconnects_per_device_per_day` | sự kiện / ngày | Số sự kiện “Mất kết nối mạng” mỗi ngày (không phải trung bình mỗi kính). | Phản ánh độ ổn định kết nối. | Cộng đồng & Thiết bị |
| Dùng đến khi pin còn 20% | `battery_to_20_p50_seconds` | giây | Số phút từ lúc bật kính đến lúc kính báo pin còn 20%. p50 là mức mà 50% lần không vượt quá. | Cho biết thời lượng pin thực tế. | Cộng đồng & Thiết bị |
| Kết nối kính | `glasses_sessions, glasses_session_seconds, glasses_active_days` | phiên, giây, ngày | Số phiên kính kết nối với server, tổng thời gian kết nối và số ngày có hoạt động. Không phải thời gian đeo kính. | Cho biết mức kết nối của thiết bị. | Cộng đồng & Thiết bị |
| Giờ cao điểm | `peak_hours.*` | giờ (0–23) | Khung giờ có nhiều lượt nhất. 24 khung 0h–23h theo giờ Việt Nam (UTC+7); lượt tính vào khung giờ lúc bắt đầu. | Giúp lên lịch bảo trì và hỗ trợ. | Thời điểm |
| Ngày dùng nhiều nhất | `busiest_weekday.*` | thứ (1–7), lượt | Ngày trong tuần có nhiều lượt nhất. Ngày tính 00:00–23:59 giờ Việt Nam, tuần từ Thứ Hai đến Chủ Nhật; lượt vắt qua nửa đêm tính vào ngày bắt đầu. | Cho biết nhịp dùng theo tuần. | Thời điểm |
| Cuối tuần | `weekend_uses` | lượt | Tổng lượt vào Thứ Bảy và Chủ Nhật. | So sánh mức dùng cuối tuần với ngày thường. | Thời điểm |
| Hoàn thành ngay lần đầu | `completion.first_try_rate` | % | Số tác vụ hoàn thành ngay lần đầu chia tổng số tác vụ. | Cho biết người dùng có phải thử lại không. | Chất lượng & tốc độ |
| Số lần thử lại TB | `completion.avg_retries` | lần | Trung bình số lần thử lại mỗi tác vụ; đếm trên lượt ghi nhận. | Cho biết mức khó dùng. | Chất lượng & tốc độ |
| Tỷ lệ bỏ cuộc | `completion.abandon_rate` | % | Số tác vụ bỏ cuộc chia tổng số tác vụ: kính hỏi lại hoặc từ chối ảnh rồi người dùng không thử lại. | Phát hiện chỗ người dùng bị kẹt. | Chất lượng & tốc độ |
| Chờ nghe tiếng đầu (thường, p50) | `speed.first_audio_p50_ms` | mili giây | p50 là mức chờ mà 50% lượt không vượt quá, tính từ lúc nhả nút đến tiếng đầu tiên. | Đo độ trễ của một lượt bình thường. | Chất lượng & tốc độ |
| Chờ nghe tiếng đầu (chậm, p90) | `speed.first_audio_p90_ms` | mili giây | p90 là mức chờ mà 90% lượt không vượt quá, tính từ lúc nhả nút đến tiếng đầu tiên: 9 trong 10 lượt không chờ lâu hơn mức này. | Đo độ trễ ở những lượt chậm. | Chất lượng & tốc độ |
| Chờ đến kết quả cuối (thường, p50) | `speed.final_result_p50_ms` | mili giây | p50 là thời gian mà 50% lượt không vượt quá, từ lúc nhả nút đến kết quả cuối. | Đo tổng thời gian chờ của người dùng. | Chất lượng & tốc độ |
| Hoạt động hôm nay (DAU) | `active_today` | chủ kính | DAU: số chủ kính hoạt động hôm nay. “Hoạt động” là có ít nhất 1 lượt sử dụng; kính chỉ kết nối thì không tính. | Đo mức duy trì theo ngày. | Gắn bó |
| Hoạt động tuần này (WAU) | `active_week` | chủ kính | WAU: số chủ kính hoạt động trong tuần này (ít nhất 1 lượt sử dụng; chỉ kết nối kính thì không tính). | Đo mức duy trì theo tuần. | Gắn bó |
| Hoạt động tháng này (MAU) | `active_month` | chủ kính | MAU: số chủ kính hoạt động trong tháng này (ít nhất 1 lượt sử dụng; chỉ kết nối kính thì không tính). | Đo mức duy trì theo tháng. | Gắn bó |
| Người dùng mới | `new_users` | tài khoản | Số tài khoản mới tạo trong kỳ. | Theo dõi tăng trưởng. | Gắn bó |
| Kính có hoạt động | `active_glasses, total_glasses` | kính | Số kính có ít nhất 1 lượt sử dụng trong kỳ trên tổng số kính; kính chỉ kết nối thì không tính. | Cho biết bao nhiêu kính đang được dùng. | Gắn bó |
| Số ngày sử dụng TB | `avg_active_days, period_days` | ngày | Trung bình số ngày có hoạt động của mỗi chủ kính trong kỳ. | Cho biết mức đều đặn khi dùng. | Gắn bó |
| Số lần | `sos.count` | lần | Tổng mọi lần kích hoạt Khẩn cấp (SOS) trong kỳ, gồm cả lần bị hủy trong 5 giây. | Theo dõi mức dùng SOS. | An toàn |
| Thành công / thất bại | `sos.success, sos.failed` | lần | Số lần SOS gửi thành công và thất bại. Tỷ lệ tính trên các lần không bị hủy trong 5 giây. | Đánh giá độ tin cậy luồng SOS. | An toàn |
| Thời gian đến khi xác nhận (thường) | `sos.confirm_p50_seconds` | giây | p50 là thời gian từ lúc kích hoạt đến khi có người nghe hoặc xác nhận. | Đo SOS được tiếp nhận nhanh đến đâu. | An toàn |
| Bị hủy trong 5 giây | `sos.cancelled_within_5s` | lần | Số lần SOS bị hủy ngay trong 5 giây đầu. | Phát hiện bấm nhầm. | An toàn |
| Số phiên | `alert_live.sessions` | phiên | Số lần chế độ cảnh báo vật cản được bật. | Theo dõi mức dùng cảnh báo vật cản live. | An toàn |
| Tổng phút bật | `alert_live.total_on_seconds` | giây | Tổng số phút chế độ cảnh báo vật cản được bật. | Cho biết chế độ này được dùng bao lâu. | An toàn |
| Cảnh báo / giờ | `alert_live.alerts_per_hour` | số cảnh báo / giờ | Tổng số cảnh báo chia tổng số giờ bật. | Chỉ cho biết tần suất, không cho biết cảnh báo đúng hay sai. | An toàn |

## Mục không phải chỉ số
- Phân bố theo giờ × thứ: 24 khung giờ 0h–23h theo giờ Việt Nam (UTC+7); một lượt tính vào khung giờ lúc bắt đầu. Ngày 00:00–23:59, tuần từ Thứ Hai đến Chủ Nhật; lượt vắt qua nửa đêm tính vào ngày bắt đầu.
- Số lượt theo trạng thái / mã lỗi: Số lượt lỗi đếm trên lượt ghi nhận, gồm cả hỏi lại, ảnh bị từ chối, bị ngắt.
- Phân bố mức cảnh báo: Bốn mức: 0 Safe, 1 Danger, 2 High Danger, 3 Critical; tỷ lệ trên tổng số cảnh báo.
- Số lượt theo trạng thái (Chất lượng): Đếm trên lượt sử dụng (không phải tác vụ): mỗi lượt kết thúc ở một trong sáu trạng thái hoàn thành, thất bại, hủy, không xác nhận hoặc bỏ cuộc.
- Chỉ ghi nhận: Đếm trên lượt ghi nhận, gồm cả hỏi lại, ảnh bị từ chối, bị ngắt. Chưa phải lượt sử dụng: người dùng thử lại ngay thì lần thử mới được tính.

## Đối chiếu S25 (mục 3, bảng 3.5)
| Chỉ số trong S25 | Nơi hiển thị | Trạng thái |
|---|---|---|
| Số lượt theo nhóm và chức năng | Tổng quan; 4 trang nhóm | Khớp. Mẫu số "% tổng lượt" thống nhất = tổng lượt kỳ (gồm SOS) |
| Thời gian sử dụng (+ trung bình mỗi chủ kính) | Tổng quan; trang nhóm | Đã sửa: thêm "TB mỗi chủ kính" |
| Thời gian kết nối kính (số phụ) | Cộng đồng & Thiết bị | Khớp (kèm "không phải thời gian đeo") |
| Số chủ kính đã dùng | Tổng quan ("Chủ kính hoạt động") | Khớp (tooltip theo S25) |
| Gắn bó: DAU / WAU / MAU, người dùng mới, kính hoạt động, số ngày sử dụng | Gắn bó | Đã sửa: hiện đủ DAU, WAU, MAU |
| Phân bố theo giờ và thứ | Thời điểm | Khớp; tổng ô heatmap = tổng lượt |
| Tỷ lệ hoàn thành, ngay lần đầu, thử lại TB, bỏ cuộc | Chất lượng & tốc độ | Đã sửa: ghi rõ "tính trên tác vụ" / "trên lượt ghi nhận" |
| Số lượt theo trạng thái và mã lỗi | Chất lượng; Lỗi hệ thống | Đã sửa: tổng lỗi bảng Lỗi hệ thống = tổng cột Lỗi các trang nhóm (13) |
| Độ trễ tiếng đầu p50 / p90; thời gian đến kết quả cuối | Chất lượng; cột "Chờ nghe tiếng đầu" | Đã sửa: nhãn "(thường, p50)", "(chậm, p90)" |
| Đọc chữ; Đọc chữ live; Nhận tiền | Đọc & Nhận diện | Khớp |
| Hỏi ảnh, tìm đồ, mô tả cảnh, hỏi vật cản | Đọc & Nhận diện; Tìm & Hiểu | Một phần: số lượt, hoàn thành, ảnh bị từ chối, thời lượng theo từng chức năng; "trạng thái kết quả" chỉ có toàn hệ thống ở trang Chất lượng |
| Trò chuyện | Kết nối | Khớp |
| Gọi người thân / nhắn tin / đọc tin | Kết nối | Đã sửa: thêm "lỗi theo mã" (mã phổ biến nhất) |
| Gọi qua Internet | Kết nối | Khớp (chưa tách đi/đến) |
| Nhạc | Kết nối | Đã sửa: thêm "Tỷ lệ hủy" |
| Khẩn cấp (SOS) | An toàn; Tổng quan | Đã sửa: 3 lần = 2 thành công + 0 thất bại + 1 hủy, thống nhất mọi trang |
| Dẫn đường, đặt xe | Di chuyển | Khớp |
| Cảnh báo vật cản live (alert_mode) | Di chuyển; An toàn | Khớp; bốn mức cộng lại = 100% |
| Kết nối kính | Cộng đồng & Thiết bị | Đã sửa: thêm "số ngày có hoạt động" |
| Tỷ lệ cài đặt kính thành công + lỗi theo mã | Cộng đồng & Thiết bị | Đã sửa: đúng 3 mã (mạng 5 GHz, không tìm thấy kính, yêu cầu liên kết hết hạn) |
| Thời gian cài đặt kính | Cộng đồng & Thiết bị | Khớp |
| Tỷ lệ tài khoản có liên hệ khẩn cấp | Cộng đồng & Thiết bị | Đã sửa: mẫu số = tổng tài khoản (2/4) |
| Số lần mất kết nối mỗi ngày | Cộng đồng & Thiết bị | Đã sửa: "sự kiện mỗi ngày" |
| Thời gian dùng đến khi pin còn 20% | Cộng đồng & Thiết bị | Khớp |
