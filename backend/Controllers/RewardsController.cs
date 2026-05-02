using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using System.Security.Claims;
using RentalCarBE.Api.Services;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/rewards")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public RewardsController(AppDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    private Guid? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return null;
        return Guid.TryParse(userId, out var guid) ? guid : null;
    }

    private string GenerateVoucherCode(string? prefix)
    {
        var cleanPrefix = string.IsNullOrWhiteSpace(prefix) ? "GIFT" : prefix.Trim().ToUpper();
        var randomPart = Guid.NewGuid().ToString("N")[..8].ToUpper();
        return $"{cleanPrefix}-{randomPart}";
    }

    private DateTime GetVietnamNow()
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
    }

    private DateTime GetVietnamToday()
    {
        var now = GetVietnamNow();
        return now.Date;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyRewardInfo()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var account = await _db.RewardPointAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        var totalPoints = account?.TotalPoints ?? 0;

        return Ok(new
        {
            totalPoints
        });
    }

    [HttpGet("redeemable-vouchers")]
    public async Task<IActionResult> GetRedeemableVouchers()
    {
        var now = DateTime.Now;

        var vouchers = await _db.Vouchers
            .AsNoTracking()
            .Where(v =>
                v.IsActive &&
                v.IsRedeemable &&
                v.StartAt <= now &&
                v.EndAt >= now &&
                v.TotalQuantity > v.UsedQuantity
            )
            .OrderBy(v => v.RedeemPoints)
            .Select(v => new
            {
                v.Id,
                v.Title,
                v.CodePrefix,
                v.DiscountType,
                v.DiscountValue,
                v.MaxDiscountValue,
                v.MinOrderValue,
                v.RedeemPoints,
                v.TotalQuantity,
                v.UsedQuantity,
                v.EndAt
            })
            .ToListAsync();

        return Ok(vouchers);
    }

    [HttpPost("redeem/{voucherId:guid}")]
    public async Task<IActionResult> RedeemVoucher(Guid voucherId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var now = DateTime.Now;

        var voucher = await _db.Vouchers.FirstOrDefaultAsync(v =>
            v.Id == voucherId &&
            v.IsActive &&
            v.IsRedeemable &&
            v.StartAt <= now &&
            v.EndAt >= now &&
            v.TotalQuantity > v.UsedQuantity
        );

        if (voucher == null)
        {
            return BadRequest(new { message = "Voucher không hợp lệ hoặc đã hết lượt đổi." });
        }

        var account = await _db.RewardPointAccounts
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        if (account == null)
        {
            account = new Models.Entities.RewardPointAccount
            {
                UserId = userId.Value,
                TotalPoints = 0,
                UpdatedAt = DateTime.UtcNow
            };

            _db.RewardPointAccounts.Add(account);
        }

        if (account.TotalPoints < voucher.RedeemPoints)
        {
            return BadRequest(new
            {
                message = $"Bạn không đủ điểm để đổi voucher này. Cần {voucher.RedeemPoints} điểm."
            });
        }

        account.TotalPoints -= voucher.RedeemPoints;
        account.UpdatedAt = DateTime.UtcNow;

        voucher.UsedQuantity += 1;

        var userVoucher = new Models.Entities.UserVoucher
        {
            UserId = userId.Value,
            VoucherId = voucher.Id,
            Code = GenerateVoucherCode(voucher.CodePrefix),
            Status = Models.Enums.UserVoucherStatus.Unused,
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = voucher.EndAt
        };

        _db.UserVouchers.Add(userVoucher);

        await _db.SaveChangesAsync();

        await _notificationService.CreateAsync(
            userId.Value,
            "Đổi voucher thành công",
            $"Bạn đã đổi thành công voucher {voucher.Title}.",
            NotificationType.System,
            "/rewards"
        );

        return Ok(new
        {
            message = "Đổi voucher thành công.",
            totalPoints = account.TotalPoints,
            voucher = new
            {
                userVoucher.Id,
                userVoucher.Code,
                userVoucher.Status,
                userVoucher.CreatedAt,
                userVoucher.ExpiredAt,
                Title = voucher.Title,
                voucher.DiscountType,
                voucher.DiscountValue,
                voucher.MaxDiscountValue,
                voucher.MinOrderValue
            }
        });
    }

    [HttpGet("my-vouchers")]
    public async Task<IActionResult> GetMyVouchers()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var vouchers = await _db.UserVouchers
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .Include(x => x.Voucher)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Status,
                x.CreatedAt,
                x.ExpiredAt,
                x.UsedAt,
                VoucherId = x.VoucherId,
                Title = x.Voucher != null ? x.Voucher.Title : "",
                DiscountType = x.Voucher != null ? x.Voucher.DiscountType.ToString() : null,
                DiscountValue = x.Voucher != null ? x.Voucher.DiscountValue : 0,
                MaxDiscountValue = x.Voucher != null ? x.Voucher.MaxDiscountValue : null,
                MinOrderValue = x.Voucher != null ? x.Voucher.MinOrderValue : null
            })
            .ToListAsync();

        return Ok(vouchers);
    }

    [HttpGet("spin-status")]
    public async Task<IActionResult> GetSpinStatus()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var today = GetVietnamToday();

        var todaySpinCount = await _db.RewardSpinHistories
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId.Value && x.SpinDate == today);

        var remainingSpins = Math.Max(0, 2 - todaySpinCount);

        var lastSpin = await _db.RewardSpinHistories
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value && x.SpinDate == today)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.RewardType,
                x.RewardValue,
                x.RewardLabel,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            canSpin = remainingSpins > 0,
            remainingSpins,
            lastSpin
        });
    }

    [HttpPost("spin")]
    public async Task<IActionResult> Spin()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var now = GetVietnamNow();
        var today = now.Date;

        var todaySpinCount = await _db.RewardSpinHistories
            .CountAsync(x => x.UserId == userId.Value && x.SpinDate == today);

        if (todaySpinCount >= 2)
        {
            return BadRequest(new { message = "Bạn đã dùng hết 2 lượt quay hôm nay rồi." });
        }

        var account = await _db.RewardPointAccounts
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        if (account == null)
        {
            account = new Models.Entities.RewardPointAccount
            {
                UserId = userId.Value,
                TotalPoints = 0,
                UpdatedAt = DateTime.UtcNow
            };

            _db.RewardPointAccounts.Add(account);
        }

        var random = new Random();
        var roll = random.Next(1, 101);

        Models.Enums.RewardType rewardType;
        int rewardValue;
        string rewardLabel;

        if (roll <= 30)
        {
            rewardType = Models.Enums.RewardType.Miss;
            rewardValue = 0;
            rewardLabel = "Chúc bạn may mắn lần sau";
        }
        else if (roll <= 80)
        {
            rewardType = Models.Enums.RewardType.Points;
            rewardValue = 10;
            rewardLabel = "+10 điểm";
        }
        else if (roll <= 90)
        {
            rewardType = Models.Enums.RewardType.Points;
            rewardValue = 20;
            rewardLabel = "+20 điểm";
        }
        else
        {
            rewardType = Models.Enums.RewardType.Points;
            rewardValue = 60;
            rewardLabel = "+50 điểm";
        }

        if (rewardType == Models.Enums.RewardType.Points)
        {
            account.TotalPoints += rewardValue;
            account.UpdatedAt = DateTime.UtcNow;
        }

        var history = new Models.Entities.RewardSpinHistory
        {
            UserId = userId.Value,
            SpinDate = today,
            RewardType = rewardType,
            RewardValue = rewardValue,
            RewardLabel = rewardLabel,
            CreatedAt = DateTime.UtcNow
        };

        _db.RewardSpinHistories.Add(history);

        await _db.SaveChangesAsync();

        await _notificationService.CreateAsync(
            userId.Value,
            "Kết quả vòng quay may mắn",
            $"Bạn vừa nhận: {rewardLabel}.",
            NotificationType.System,
            "/rewards"
        );

        var remainingSpins = Math.Max(0, 2 - (todaySpinCount + 1));

        return Ok(new
        {
            message = "Quay thưởng thành công.",
            canSpin = remainingSpins > 0,
            remainingSpins,
            reward = new
            {
                rewardType,
                rewardValue,
                rewardLabel
            },
            totalPoints = account.TotalPoints
        });
    }
    [HttpGet("history")]
    public async Task<IActionResult> GetRewardHistory()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Bạn chưa đăng nhập." });
        }

        var spinHistory = await _db.RewardSpinHistories
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                type = "spin",
                createdAt = x.CreatedAt,
                title = "Vòng quay may mắn",
                description = x.RewardLabel,
                points = x.RewardValue
            })
            .ToListAsync();

        var redeemHistory = await _db.UserVouchers
            .AsNoTracking()
            .Where(x => x.UserId == userId.Value)
            .Include(x => x.Voucher)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                type = "redeem",
                createdAt = x.CreatedAt,
                title = "Đổi voucher",
                description = x.Voucher != null ? x.Voucher.Title : "Voucher",
                points = x.Voucher != null ? x.Voucher.RedeemPoints : 0,
                code = x.Code
            })
            .ToListAsync();

        var history = spinHistory
            .Concat<object>(redeemHistory)
            .OrderByDescending(x => ((dynamic)x).createdAt)
            .ToList();

        return Ok(history);
    }
}