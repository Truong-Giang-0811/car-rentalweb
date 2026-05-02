using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class UserVoucher
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    [Required]
    public Guid VoucherId { get; set; }
    public Voucher? Voucher { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public UserVoucherStatus Status { get; set; } = UserVoucherStatus.Unused;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiredAt { get; set; }

    public DateTime? UsedAt { get; set; }
}