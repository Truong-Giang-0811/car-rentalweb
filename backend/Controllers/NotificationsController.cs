using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using System.Security.Claims;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(idStr!);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int take = 20)
    {
        take = Math.Clamp(take, 1, 100);
        var userId = GetUserId();

        var data = await _db.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(take)
            .Select(x => new
            {
                x.Id,
                x.Type,
                x.Title,
                x.Body,
                x.IsRead,
                x.ActionUrl,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();

        var count = await _db.Notifications
            .CountAsync(x => x.UserId == userId && !x.IsRead);

        return Ok(new { count });
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetUserId();

        var notification = await _db.Notifications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Thông báo không tồn tại." });

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Đã đánh dấu đã đọc." });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();

        var notifications = await _db.Notifications
            .Where(x => x.UserId == userId && !x.IsRead)
            .ToListAsync();

        foreach (var item in notifications)
        {
            item.IsRead = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã đánh dấu tất cả là đã đọc." });
    }
}