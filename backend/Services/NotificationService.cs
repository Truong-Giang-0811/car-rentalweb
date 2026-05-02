using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Entities;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Services;

public interface INotificationService
{
    Task CreateAsync(
        Guid userId,
        string title,
        string body,
        NotificationType type = NotificationType.System,
        string? actionUrl = null);

    Task CreateManyAsync(
        IEnumerable<Guid> userIds,
        string title,
        string body,
        NotificationType type = NotificationType.System,
        string? actionUrl = null);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateAsync(
        Guid userId,
        string title,
        string body,
        NotificationType type = NotificationType.System,
        string? actionUrl = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Body = body,
            Type = type,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
    }

    public async Task CreateManyAsync(
        IEnumerable<Guid> userIds,
        string title,
        string body,
        NotificationType type = NotificationType.System,
        string? actionUrl = null)
    {
        var notifications = userIds.Select(userId => new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Body = body,
            Type = type,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();
    }
}