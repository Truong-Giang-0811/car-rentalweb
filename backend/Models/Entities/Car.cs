using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class Car
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid OwnerId { get; set; }
    public AppUser? Owner { get; set; }

    [Required, MaxLength(20)]
    public string LicensePlate { get; set; } = string.Empty;   // biển số *

    [Required, MaxLength(60)]
    public string Brand { get; set; } = string.Empty;          // hãng *

    [Required, MaxLength(60)]
    public string Model { get; set; } = string.Empty;          // mẫu *

    [Required]
    public int Year { get; set; }                              // năm sx *

    [Required]
    public int Seats { get; set; }                             // số ghế *

    [Required]
    public TransmissionType Transmission { get; set; }         // truyền động *

    [Required]
    public FuelType Fuel { get; set; }                         // nhiên liệu *

    // mức tiêu thụ nhiên liệu (VD: 7.5 L/100km)
    [Column(TypeName = "decimal(6,2)")]
    public decimal? FuelConsumption { get; set; }

    [Required, MaxLength(255)]
    public string Address { get; set; } = string.Empty;        // địa chỉ xe *

    [MaxLength(1000)]
    public string? Description { get; set; }                   // mô tả

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerDay { get; set; }                   // giá / ngày

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
    
}