using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class Conversation
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Optional: gắn hội thoại theo booking để sau này dễ trace
    public Guid? BookingId { get; set; }
    public Booking? Booking { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}