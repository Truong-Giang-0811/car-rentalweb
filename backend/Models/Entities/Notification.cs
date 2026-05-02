using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class Notification
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    public NotificationType Type { get; set; } = NotificationType.System;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Body { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    // Optional deep link (mở chat/booking/post)
    [MaxLength(500)]
    public string? ActionUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}