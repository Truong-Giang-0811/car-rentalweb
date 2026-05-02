using System.ComponentModel.DataAnnotations;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Models.Entities;

public class AppUser
{
	[Key]
	public Guid Id { get; set; } = Guid.NewGuid();

	[Required, MaxLength(120)]
	public string FullName { get; set; } = string.Empty;

	[Required, MaxLength(120)]
	public string Email { get; set; } = string.Empty;

	[MaxLength(20)]
	public string? PhoneNumber { get; set; }

	// Password hash (đừng lưu password plain text)
	[Required, MaxLength(255)]
	public string PasswordHash { get; set; } = string.Empty;

	public UserRole Role { get; set; } = UserRole.Customer;

	public bool IsActive { get; set; } = true;

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	// Navigation
	public ICollection<Car> Cars { get; set; } = new List<Car>();              // Owner
	
	public ICollection<Post> Posts { get; set; } = new List<Post>();
	public ICollection<PostComment> PostComments { get; set; } = new List<PostComment>();
	public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();
	public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
	public ICollection<Message> Messages { get; set; } = new List<Message>();
	public ICollection<ConversationParticipant> ConversationParticipants { get; set; } = new List<ConversationParticipant>();
}