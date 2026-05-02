using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.DTOs.Cars;

public class CreateCarDto
{
    public string LicensePlate { get; set; } = "";
    public string Brand { get; set; } = "";
    public string Model { get; set; } = "";
    public int Year { get; set; }
    public int Seats { get; set; }
    public TransmissionType Transmission { get; set; }
    public FuelType Fuel { get; set; }
    public decimal? FuelConsumption { get; set; }
    public string Address { get; set; } = "";
    public string? Description { get; set; }
    public decimal PricePerDay { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}