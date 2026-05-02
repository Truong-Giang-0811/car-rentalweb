using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class FavoriteCar
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public AppUser? User { get; set; }

    [Required]
    public Guid CarId { get; set; }

    public Car? Car { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}