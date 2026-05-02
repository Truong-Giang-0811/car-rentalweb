using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Dtos.Vouchers;

public class ValidateVoucherCodeDto
{
    [Required]
    public string Code { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
}