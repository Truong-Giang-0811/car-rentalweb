using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.DTOs.Auth;

public class RegisterDto
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required, MinLength(6), MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}