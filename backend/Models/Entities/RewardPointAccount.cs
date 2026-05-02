using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class RewardPointAccount
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    public int TotalPoints { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}