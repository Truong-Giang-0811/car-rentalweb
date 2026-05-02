using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.DTOs.Users;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Họ tên không được để trống")]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    [MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
    public string? PhoneNumber { get; set; }
}