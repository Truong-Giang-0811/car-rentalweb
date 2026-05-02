using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Entities;
using System.Security.Claims;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _db;
    public FavoritesController(AppDbContext db) => _db = db;

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        return Guid.Parse(idStr!);
    }

    // GET /api/favorites
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var cars = await _db.FavoriteCars
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.Car!.Id,
                f.Car.Brand,
                f.Car.Model,
                f.Car.Year,
                f.Car.Seats,
                f.Car.Transmission,
                f.Car.Fuel,
                f.Car.Address,
                f.Car.PricePerDay,
                Thumbnail = _db.CarImages
                    .Where(i => i.CarId == f.CarId && (int)i.Type >= 0 && (int)i.Type <= 3)
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
            c.Seats,
            c.Transmission,
            c.Fuel,
            c.Address,
            c.PricePerDay,
            Thumbnail = string.IsNullOrWhiteSpace(c.Thumbnail) ? null : $"{baseUrl}{c.Thumbnail}",
            IsFavorite = true
        });

        return Ok(result);
    }

    // GET /api/favorites/check/{carId}
    [HttpGet("check/{carId:guid}")]
    public async Task<IActionResult> CheckFavorite(Guid carId)
    {
        var userId = GetUserId();

        var isFavorite = await _db.FavoriteCars
            .AnyAsync(x => x.UserId == userId && x.CarId == carId);

        return Ok(new { isFavorite });
    }

    // POST /api/favorites/toggle/{carId}
    [HttpPost("toggle/{carId:guid}")]
    public async Task<IActionResult> ToggleFavorite(Guid carId)
    {
        var userId = GetUserId();

        var carExists = await _db.Cars.AnyAsync(c => c.Id == carId && c.IsAvailable);
        if (!carExists)
            return NotFound(new { message = "Xe không tồn tại." });

        var existing = await _db.FavoriteCars
            .FirstOrDefaultAsync(x => x.UserId == userId && x.CarId == carId);

        if (existing != null)
        {
            _db.FavoriteCars.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok(new { isFavorite = false });
        }

        var favorite = new FavoriteCar
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CarId = carId,
            CreatedAt = DateTime.UtcNow
        };

        _db.FavoriteCars.Add(favorite);
        await _db.SaveChangesAsync();

        return Ok(new { isFavorite = true });
    }
}