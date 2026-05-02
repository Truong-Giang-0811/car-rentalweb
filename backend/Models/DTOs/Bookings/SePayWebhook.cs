namespace RentalCarBE.Api.Models.DTOs.Bookings;

public class SePayWebhookDto
{
    public string Gateway { get; set; }        // Tên ngân hàng (BIDV)
    public string Content { get; set; }        // Nội dung chuyển khoản
    public decimal TransferAmount { get; set; } // Số tiền nhận được
    public string TransferType { get; set; }   // Loại giao dịch (In/Out)
    public string ReferenceCode { get; set; }  // Mã giao dịch của ngân hàng
}