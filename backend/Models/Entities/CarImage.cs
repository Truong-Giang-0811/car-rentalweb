using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class CarImage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CarId { get; set; }
    public Car? Car { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty; // lưu URL (sau bạn có thể đổi sang lưu file)

    public CarImageType Type { get; set; } = CarImageType.Exterior;

    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}