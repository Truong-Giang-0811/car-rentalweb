using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Dtos.Vouchers;
using RentalCarBE.Api.Models.Entities;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/admin/vouchers")]
public class AdminVouchersController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminVouchersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vouchers = await _db.Vouchers
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.CodePrefix,
                x.DiscountType,
                x.DiscountValue,
                x.MaxDiscountValue,
                x.MinOrderValue,
                x.TotalQuantity,
                x.UsedQuantity,
                x.RedeemPoints,
                x.IsRedeemable,
                x.IsPublicPromotion,
                x.IsActive,
                x.StartAt,
                x.EndAt,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(vouchers);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var voucher = await _db.Vouchers
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.CodePrefix,
                x.DiscountType,
                x.DiscountValue,
                x.MaxDiscountValue,
                x.MinOrderValue,
                x.TotalQuantity,
                x.UsedQuantity,
                x.RedeemPoints,
                x.IsRedeemable,
                x.IsPublicPromotion,
                x.IsActive,
                x.StartAt,
                x.EndAt,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (voucher == null)
            return NotFound(new { message = "Không tìm thấy voucher." });

        return Ok(voucher);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVoucherDto dto)
    {
        if (dto.EndAt <= dto.StartAt)
            return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu." });

        var voucher = new Voucher
        {
            Title = dto.Title,
            CodePrefix = dto.CodePrefix,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MaxDiscountValue = dto.MaxDiscountValue,
            MinOrderValue = dto.MinOrderValue,
            TotalQuantity = dto.TotalQuantity,
            RedeemPoints = dto.RedeemPoints,
            IsRedeemable = dto.IsRedeemable,
            IsPublicPromotion = dto.IsPublicPromotion,
            IsActive = dto.IsActive,
            StartAt = dto.StartAt,
            EndAt = dto.EndAt
        };

        _db.Vouchers.Add(voucher);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Tạo voucher thành công.", id = voucher.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVoucherDto dto)
    {
        var voucher = await _db.Vouchers.FirstOrDefaultAsync(x => x.Id == id);
        if (voucher == null)
            return NotFound(new { message = "Không tìm thấy voucher." });

        if (dto.EndAt <= dto.StartAt)
            return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu." });

        voucher.Title = dto.Title;
        voucher.CodePrefix = dto.CodePrefix;
        voucher.DiscountType = dto.DiscountType;
        voucher.DiscountValue = dto.DiscountValue;
        voucher.MaxDiscountValue = dto.MaxDiscountValue;
        voucher.MinOrderValue = dto.MinOrderValue;
        voucher.TotalQuantity = dto.TotalQuantity;
        voucher.RedeemPoints = dto.RedeemPoints;
        voucher.IsRedeemable = dto.IsRedeemable;
        voucher.IsPublicPromotion = dto.IsPublicPromotion;
        voucher.IsActive = dto.IsActive;
        voucher.StartAt = dto.StartAt;
        voucher.EndAt = dto.EndAt;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật voucher thành công." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var voucher = await _db.Vouchers.FirstOrDefaultAsync(x => x.Id == id);
        if (voucher == null)
            return NotFound(new { message = "Không tìm thấy voucher." });

        _db.Vouchers.Remove(voucher);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Xóa voucher thành công." });
    }
}