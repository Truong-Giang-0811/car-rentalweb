using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class Message
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    [Required]
    public Guid SenderId { get; set; }
    public AppUser? Sender { get; set; }

    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}