using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Entities;
using System.Security.Claims;
using RentalCarBE.Api.Models.DTOs.Users;
using Microsoft.AspNetCore.Identity;
using BCrypt.Net;

namespace RentalCarBE.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize] // Bắt buộc phải đăng nhập mới dùng được các API này
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;
    public UserController(AppDbContext db) => _db = db;

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(idStr!);
    }
    // --- DÀNH CHO NGƯỜI DÙNG (CUSTOMER/OWNER) ---

    [HttpGet("profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        var user = await _db.AppUsers
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                Role = u.Role.ToString(),
                u.CreatedAt
            })
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });
        return Ok(user);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _db.AppUsers.FindAsync(userId);

        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

        // 1. Kiểm tra nếu người dùng muốn đổi Email
        var newEmail = dto.Email.Trim().ToLower();
        if (user.Email.ToLower() != newEmail)
        {
            // Kiểm tra xem email mới này đã có ai khác sử dụng chưa
            var emailExists = await _db.AppUsers
                .AnyAsync(u => u.Email.ToLower() == newEmail && u.Id != userId);

            if (emailExists)
                return BadRequest(new { message = "Email này đã được sử dụng bởi tài khoản khác." });

            user.Email = newEmail;
        }

        // 2. Cập nhật các thông tin còn lại
        user.FullName = dto.FullName.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Cập nhật thông tin thành công",
            fullName = user.FullName,
            email = user.Email
        });
    }

    // --- DÀNH CHO ADMIN ---

    [HttpGet("all")]
    [Authorize(Roles = "Owner,Admin")] // Chỉ Admin mới có quyền xem tất cả
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.AppUsers
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                Role = u.Role.ToString()
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner,Admin")] // Chỉ Admin mới có quyền xóa
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _db.AppUsers.FindAsync(id);
        if (user == null) return NotFound(new { message = "Người dùng không tồn tại" });

        // Thay vì xóa cứng, bạn có thể chuyển IsActive = false để ẩn đi
        _db.AppUsers.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa người dùng thành công" });
    }
    // api/user/change-password
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetUserId();
        var user = await _db.AppUsers.FindAsync(userId);

        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng" });

        // 🔥 VERIFY PASSWORD (BCrypt)
        bool isValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);

        if (!isValid)
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });

        // 🔥 HASH PASSWORD MỚI
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        await _db.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
}