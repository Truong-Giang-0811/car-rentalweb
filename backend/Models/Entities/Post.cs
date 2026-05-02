using System.ComponentModel.DataAnnotations;

namespace RentalCarBE.Api.Models.Entities;

public class Post
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AuthorId { get; set; }
    public AppUser? Author { get; set; }

    [Required, MaxLength(3000)]
    public string Content { get; set; } = string.Empty;

    // Optional ảnh bài viết
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
}