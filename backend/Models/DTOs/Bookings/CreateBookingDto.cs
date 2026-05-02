namespace RentalCarBE.Api.Models.DTOs.Bookings;

public class CreateBookingDto
{
    public Guid CarId { get; set; }

    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }

    public int PickupType { get; set; } // 0 tự lấy, 1 giao tận nơi
    public string PickupAddress { get; set; } = string.Empty;

    public string? Note { get; set; }

    public decimal PricePerDay { get; set; }
    public decimal InsurancePerDay { get; set; }
    public int RentalDays { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public string RentalPapers { get; set; } = string.Empty;
    public string Collateral { get; set; } = string.Empty;

    public bool CustomerAgreedTerms { get; set; }
}