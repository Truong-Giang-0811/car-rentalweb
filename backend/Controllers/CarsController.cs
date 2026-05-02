using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.DTOs.Cars;
using RentalCarBE.Api.Models.Entities;
using System.Security.Claims;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CarsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CarsController(AppDbContext db) => _db = db;

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(idStr!);
    }

    // GET /api/cars/my  (xe của chủ đang đăng nhập)
    [HttpGet("my")]
    public async Task<IActionResult> GetMyCars()
    {
        var userId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/";

        var cars = await _db.Cars
            .AsNoTracking()
            .Where(c => c.OwnerId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Brand,
                c.Model,
                c.Year,
                c.LicensePlate,
                c.Seats,
                c.Address,
                c.Fuel,
                c.FuelConsumption,
                c.Transmission,
                c.PricePerDay,
                c.IsAvailable,
                c.CreatedAt,
                c.Description,

                // lấy ảnh type=0 (front) làm thumbnail, không có thì lấy ảnh đầu tiên
                Thumbnail =
                _db.CarImages
                    .Where(i => i.CarId == c.Id)
                    .OrderBy(i => i.Type)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            })
        .ToListAsync();

        var result = cars.Select(c => new
        {
            c.Id,
            c.Brand,
            c.Model,
            c.Year,
            c.LicensePlate,
            c.Seats,
            c.Address,
            c.Fuel,
            c.Transmission,
            c.PricePerDay,
            c.IsAvailable,
            c.CreatedAt,
            Thumbnail = string.IsNullOrWhiteSpace(c.Thumbnail)
                ? null
                : $"{c.Thumbnail}"
        });

        return Ok(result);
    }

    // POST /api/cars
    [HttpPost]
    public async Task<IActionResult> CreateCar([FromBody] CreateCarDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.LicensePlate) ||
            string.IsNullOrWhiteSpace(dto.Brand) ||
            string.IsNullOrWhiteSpace(dto.Model) ||
            string.IsNullOrWhiteSpace(dto.Address))
            return BadRequest(new { message = "Thiếu thông tin bắt buộc." });

        var userId = GetUserId();

        var car = new Car
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            LicensePlate = dto.LicensePlate.Trim(),
            Brand = dto.Brand.Trim(),
            Model = dto.Model.Trim(),
            Year = dto.Year,
            Seats = dto.Seats,
            Transmission = dto.Transmission,
            Fuel = dto.Fuel,
            FuelConsumption = dto.FuelConsumption,
            Address = dto.Address.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            PricePerDay = dto.PricePerDay,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Cars.Add(car);
        await _db.SaveChangesAsync();

        return Ok(new { car.Id });
    }
    // PUT /api/cars/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(Guid id, [FromBody] CreateCarDto dto)
    {
        var userId = GetUserId();
        var car = await _db.Cars.FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == userId);

        if (car == null) return NotFound(new { message = "Không tìm thấy xe hoặc bạn không có quyền chỉnh sửa." });

        // Cập nhật thông tin
        car.LicensePlate = dto.LicensePlate?.Trim();
        car.Brand = dto.Brand?.Trim();
        car.Model = dto.Model?.Trim();
        car.Year = dto.Year;
        car.Seats = dto.Seats;
        car.Transmission = dto.Transmission;
        car.Fuel = dto.Fuel;
        car.FuelConsumption = dto.FuelConsumption;
        car.Address = dto.Address?.Trim();
        car.Description = dto.Description?.Trim();
        car.PricePerDay = dto.PricePerDay;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công." });
    }
    // DELETE /api/cars/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCar(Guid id)
    {
        var userId = GetUserId();
        var car = await _db.Cars.FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == userId);

        if (car == null) return NotFound(new { message = "Không tìm thấy xe hoặc bạn không có quyền xóa." });

        // Xóa các ảnh liên quan trước (nếu database không để Cascade Delete)
        var images = _db.CarImages.Where(i => i.CarId == id);
        _db.CarImages.RemoveRange(images);

        _db.Cars.Remove(car);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa xe thành công." });
    }

    // GET /api/cars/{id}  (chi tiết 1 xe của chủ)
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCarDetail(Guid id)
    {
        var userId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var car = await _db.Cars
            .AsNoTracking()
            .Where(c => c.Id == id && c.OwnerId == userId)
            .Select(c => new
            {
                c.Id,
                c.LicensePlate,
                c.Brand,
                c.Model,
                c.Year,
                c.Seats,
                c.Transmission,
                c.Fuel,
                c.FuelConsumption,
                c.Address,
                c.Description,
                c.PricePerDay,
                c.IsAvailable,
                c.CreatedAt,

                Images = _db.CarImages
                    .Where(i => i.CarId == c.Id && (int)i.Type >= 0 && (int)i.Type <= 3)
                    .OrderBy(i => i.Type)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => new
                    {
                        i.Id,
                        i.Url,
                        i.Type,
                        i.SortOrder
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (car == null)
            return NotFound(new { message = "Không tìm thấy xe." });

        var result = new
        {
            car.Id,
            car.LicensePlate,
            car.Brand,
            car.Model,
            car.Year,
            car.Seats,
            car.Transmission,
            car.Fuel,
            car.FuelConsumption,
            car.Address,
            car.Description,
            car.PricePerDay,
            car.IsAvailable,
            car.CreatedAt,
            Images = car.Images.Select(i => new
            {
                i.Id,
                Url = string.IsNullOrWhiteSpace(i.Url) ? null : $"{baseUrl}{i.Url}",
                i.Type,
                i.SortOrder
            })
        };

        return Ok(result);
    }

}