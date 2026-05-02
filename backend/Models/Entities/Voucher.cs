using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class Voucher
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? CodePrefix { get; set; }

    [Required]
    public DiscountType DiscountType { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxDiscountValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinOrderValue { get; set; }

    public int TotalQuantity { get; set; } = 0;

    public int UsedQuantity { get; set; } = 0;

    public int RedeemPoints { get; set; } = 0;

    public bool IsRedeemable { get; set; } = false; // có thể đổi bằng điểm

    public bool IsPublicPromotion { get; set; } = false; // hiện ở form thuê

    public bool IsActive { get; set; } = true;

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}