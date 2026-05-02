using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Entities;
using System.Security.Claims;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/cars/{carId:guid}/images")]
[Authorize]
public class CarImagesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CarImagesController(AppDbContext db) => _db = db;

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(idStr!);
    }

    public class AddCarImageDto
    {
        public string Url { get; set; } = "";
        public int Type { get; set; } = 0;
        public int SortOrder { get; set; } = 0;
    }

    [HttpPost]
    public async Task<IActionResult> AddImage(Guid carId, [FromBody] AddCarImageDto dto)
    {
        var userId = GetUserId();

        var car = await _db.Cars.FirstOrDefaultAsync(c => c.Id == carId);
        if (car == null) return NotFound(new { message = "Xe không tồn tại." });
        if (car.OwnerId != userId) return StatusCode(403, new { message = "Bạn không có quyền thêm ảnh xe này." });

        if (string.IsNullOrWhiteSpace(dto.Url))
            return BadRequest(new { message = "Url ảnh không hợp lệ." });

        var img = new CarImage
        {
            Id = Guid.NewGuid(),
            CarId = carId,
            Url = dto.Url.Trim(),
            Type = (RentalCarBE.Api.Models.Enums.CarImageType)dto.Type, // nếu bạn có enum
            SortOrder = dto.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _db.CarImages.Add(img);
        await _db.SaveChangesAsync();

        return Ok(new { img.Id });
    }
}