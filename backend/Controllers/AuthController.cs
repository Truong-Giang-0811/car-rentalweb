using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.DTOs.Auth;
using RentalCarBE.Api.Models.Entities;
using RentalCarBE.Api.Models.Enums;
using RentalCarBE.Api.Services;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        var exists = await _db.AppUsers.AnyAsync(x => x.Email.ToLower() == email);
        if (exists) return BadRequest(new { message = "Email đã tồn tại." });

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = email,
            PhoneNumber = dto.PhoneNumber?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer, // ✅ chỉ Customer được đăng ký
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.AppUsers.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.CreateToken(user);
        return Ok(new
        {
            token,
            user = new { user.Id, user.FullName, user.Email, user.PhoneNumber, role = user.Role.ToString() }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await _db.AppUsers.FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (user == null) return Unauthorized(new { message = "Sai email hoặc mật khẩu." });
        if (!user.IsActive) return Unauthorized(new { message = "Tài khoản đã bị khóa." });

        var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!ok) return Unauthorized(new { message = "Sai email hoặc mật khẩu." });

        var token = _jwt.CreateToken(user);
        return Ok(new
        {
            token,
            user = new { user.Id, user.FullName, user.Email, user.PhoneNumber, role = user.Role.ToString() }
        });
    }
}