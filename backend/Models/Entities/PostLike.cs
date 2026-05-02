using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class PostLike
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PostId { get; set; }
    public Post? Post { get; set; }

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}