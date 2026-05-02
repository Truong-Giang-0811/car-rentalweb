namespace RentalCarBE.Api.Models.Enums;

public enum BookingStatus
{
    
    Pending = 0,        // Khách vừa bấm "Chọn thuê", chờ chủ xe đồng ý hoặc chờ thanh toán (tùy luồng)
    Rejected = 1,       // Chủ xe từ chối yêu cầu thuê

    // 2. Giai đoạn Thanh toán & Giữ chỗ
    WaitingForDeposit = 2, // Chủ xe đã duyệt, hệ thống chờ khách thanh toán tiền cọc/toàn bộ
    Confirmed = 3,         // Khách đã thanh toán thành công, xe đã được "khóa" lịch chắc chắn

    // 3. Giai đoạn Thực hiện hợp đồng
    PickedUp = 4,       // Đang thuê (Chủ xe đã bấm xác nhận bàn giao xe và chìa khóa)

    // 4. Giai đoạn Kết thúc
    Completed = 5,      // Đã trả xe thành công, không có tranh chấp

    // 5. Giai đoạn Hủy & Quá hạn
    Cancelled = 6,      // Khách hàng chủ động hủy đơn
    Expired = 7,        // Đơn bị hệ thống tự động hủy do khách không thanh toán đúng hạn

    // 6. Giai đoạn Hậu mãi/Tranh chấp (Nâng cao)
    PendingSettlement = 8 // Xe đã trả nhưng chờ xử lý vi phạm (phạt nguội) hoặc hư hại phát sinh
}