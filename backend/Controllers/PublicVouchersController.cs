using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Enums;
using RentalCarBE.Api.Dtos.Vouchers;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/public/vouchers")]
public class PublicVouchersController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicVouchersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicVouchers()
    {
        var now = DateTime.Now;

        var vouchers = await _db.Vouchers
            .AsNoTracking()
            .Where(v =>
                v.IsActive &&
                v.IsPublicPromotion &&
                v.StartAt <= now &&
                v.EndAt >= now &&
                v.TotalQuantity > v.UsedQuantity
            )
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.Id,
                v.Title,
                v.CodePrefix,
                v.DiscountType,
                v.DiscountValue,
                v.MaxDiscountValue,
                v.MinOrderValue,
                v.StartAt,
                v.EndAt
            })
            .ToListAsync();

        return Ok(vouchers);
    }

    [HttpPost("validate-code")]
    public async Task<IActionResult> ValidateVoucherCode([FromBody] ValidateVoucherCodeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new
            {
                isValid = false,
                message = "Vui lòng nhập mã khuyến mãi."
            });
        }

        var now = DateTime.Now;
        var code = dto.Code.Trim().ToUpper();

        var voucher = await _db.Vouchers
            .AsNoTracking()
            .FirstOrDefaultAsync(v =>
                v.IsActive &&
                v.CodePrefix != null &&
                v.CodePrefix.ToUpper() == code &&
                v.StartAt <= now &&
                v.EndAt >= now &&
                v.TotalQuantity > v.UsedQuantity
            );

        if (voucher == null)
        {
            return Ok(new
            {
                isValid = false,
                message = "Mã khuyến mãi không hợp lệ hoặc đã hết hạn."
            });
        }

        if (voucher.MinOrderValue.HasValue && dto.Subtotal < voucher.MinOrderValue.Value)
        {
            return Ok(new
            {
                isValid = false,
                message = $"Đơn hàng chưa đạt tối thiểu {voucher.MinOrderValue.Value.ToString("N0")}đ để dùng mã này."
            });
        }

        return Ok(new
        {
            isValid = true,
            message = "Áp dụng mã thành công.",
            voucher = new
            {
                voucher.Id,
                voucher.Title,
                voucher.CodePrefix,
                voucher.DiscountType,
                voucher.DiscountValue,
                voucher.MaxDiscountValue,
                voucher.MinOrderValue
            }
        });
    }
}

