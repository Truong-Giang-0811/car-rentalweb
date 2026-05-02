namespace RentalCarBE.Api.Models.DTOs.Posts;

public record PostListItemDto(
    Guid Id,
    string UserName,
    string UserAvatar,
    DateTime CreatedAt,
    string Content,
    string? ImageUrl,
    int LikedCount,
    int CommentCount,
    bool IsLiked
);

public record CreatePostDto(string Content, string? ImageUrl);

public record CreateCommentDto(string Content);

public record CommentDto(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    string UserName,
    string UserAvatar
);