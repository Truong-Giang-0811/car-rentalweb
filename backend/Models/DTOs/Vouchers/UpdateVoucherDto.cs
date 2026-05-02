using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Dtos.Vouchers;

public class UpdateVoucherDto
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? CodePrefix { get; set; }

    [Required]
    public DiscountType DiscountType { get; set; }

    [Required]
    public decimal DiscountValue { get; set; }

    public decimal? MaxDiscountValue { get; set; }

    public decimal? MinOrderValue { get; set; }

    public int TotalQuantity { get; set; } = 0;

    public int RedeemPoints { get; set; } = 0;

    public bool IsRedeemable { get; set; } = false;

    public bool IsPublicPromotion { get; set; } = false;

    public bool IsActive { get; set; } = true;

    [Required]
    public DateTime StartAt { get; set; }

    [Required]
    public DateTime EndAt { get; set; }
}