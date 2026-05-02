using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class RewardSpinHistory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    [Required]
    public DateTime SpinDate { get; set; }

    [Required]
    public RewardType RewardType { get; set; }

    public int RewardValue { get; set; } = 0;

    [Required, MaxLength(100)]
    public string RewardLabel { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}