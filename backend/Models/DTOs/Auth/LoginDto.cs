using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.DTOs.Auth;

public class LoginDto
{
    [Required, EmailAddress, MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}