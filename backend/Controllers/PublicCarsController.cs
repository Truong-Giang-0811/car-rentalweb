using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Helpers;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/public/cars")]
public class PublicCarsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicCarsController(AppDbContext db)
    {
        _db = db;
    }

    // API tìm xe public
    [HttpGet]
    public async Task<IActionResult> SearchCars([FromQuery] string? location = null)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var cars = await _db.Cars
            .AsNoTracking()
            .Where(c => c.IsAvailable)
            .Select(c => new
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

                Thumbnail = _db.CarImages
                    .Where(i => i.CarId == c.Id)
                    .OrderBy(i => i.Type)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            })
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(location))
        {
            var keyword = StringHelper.RemoveDiacritics(location).ToLower();

            cars = cars
                .Where(c =>
                    StringHelper.RemoveDiacritics(c.Address ?? "")
                        .ToLower()
                        .Contains(keyword)
                )
                .ToList();
        }

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
            Thumbnail = string.IsNullOrWhiteSpace(c.Thumbnail)
                ? null
                : $"{baseUrl}{c.Thumbnail}"
        });

        return Ok(result);
    }

    // API gợi ý địa điểm
    [HttpGet("locations")]
    public async Task<IActionResult> SuggestLocations([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Ok(new List<string>());

        var key = StringHelper.RemoveDiacritics(keyword).ToLower();

        var addresses = await _db.Cars
            .AsNoTracking()
            .Where(c => c.IsAvailable)
            .Select(c => c.Address)
            .Where(a => a != null)
            .ToListAsync();

        var results = addresses
            .Where(a =>
                StringHelper.RemoveDiacritics(a!)
                    .ToLower()
                    .Contains(key)
            )
            .Distinct()
            .Take(8)
            .ToList();

        return Ok(results);
    }

    // GET /api/public/cars/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPublicCarDetail(Guid id)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var car = await _db.Cars
            .AsNoTracking()
            .Where(c => c.Id == id && c.IsAvailable)
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
                Owner = c.Owner == null ? null : new
                {
                    c.Owner.Id,
                    c.Owner.FullName,
                    c.Owner.PhoneNumber
                },

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
            Owner = car.Owner,
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