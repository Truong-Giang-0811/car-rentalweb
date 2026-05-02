using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class Booking
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CarId { get; set; }
    public Car? Car { get; set; }

    // người thuê xe
    [Required]
    public Guid CustomerId { get; set; }
    public AppUser? Customer { get; set; }

    // chủ xe
    [Required]
    public Guid OwnerId { get; set; }
    public AppUser? Owner { get; set; }

    [Required]
    public DateTime StartAt { get; set; }

    [Required]
    public DateTime EndAt { get; set; }

    // 0 = tự đến lấy xe, 1 = giao tận nơi
    public int PickupType { get; set; } = 0;

    [MaxLength(500)]
    public string PickupAddress { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Note { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerDay { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal InsurancePerDay { get; set; } = 0;

    public int RentalDays { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(500)]
    public string RentalPapers { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Collateral { get; set; } = string.Empty;

    [MaxLength(200)]
    public string CarNameSnapshot { get; set; } = string.Empty;

    [MaxLength(50)]
    public string CarLicensePlateSnapshot { get; set; } = string.Empty;

    [MaxLength(120)]
    public string CustomerNameSnapshot { get; set; } = string.Empty;

    [MaxLength(120)]
    public string OwnerNameSnapshot { get; set; } = string.Empty;

    public bool CustomerAgreedTerms { get; set; } = false;
    public DateTime? CustomerAgreedAt { get; set; }

    [MaxLength(255)]
    public string? CustomerAgreementReason { get; set; }

    public bool OwnerAgreedTerms { get; set; } = false;
    public DateTime? OwnerAgreedAt { get; set; }

    [MaxLength(255)]
    public string? OwnerAgreementReason { get; set; }

    public string ContractSnapshot { get; set; } = string.Empty;

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public RentalAgreement? RentalAgreement { get; set; }
}