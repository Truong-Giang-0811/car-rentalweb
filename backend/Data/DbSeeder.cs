using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Models.Entities;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Data;

public static class DbSeeder
{
    public static async Task SeedOwnerAsync(AppDbContext db, IConfiguration config)
    {
        var email = config["OwnerSeed:Email"]?.Trim().ToLower();
        var password = config["OwnerSeed:Password"];
        var fullName = config["OwnerSeed:FullName"] ?? "Owner";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var exists = await db.AppUsers.AnyAsync(x => x.Email.ToLower() == email);
        if (exists) return;

        var owner = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Owner,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.AppUsers.Add(owner);
        await db.SaveChangesAsync();
    }
}