using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class ConversationParticipant
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    [Required]
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}