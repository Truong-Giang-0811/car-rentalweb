using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class RentalAgreement
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid BookingId { get; set; }
    public Booking? Booking { get; set; }

    // Nội dung hợp đồng (text)
    [Required]
    public string AgreementContent { get; set; } = string.Empty;

    // Xác nhận khách
    public bool CustomerAccepted { get; set; } = false;
    public DateTime? CustomerAcceptedAt { get; set; }

    // Xác nhận chủ xe
    public bool OwnerAccepted { get; set; } = false;
    public DateTime? OwnerAcceptedAt { get; set; }

    // THÊM MỚI 
    [MaxLength(50)]
    public string ContractNumber { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PdfUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}