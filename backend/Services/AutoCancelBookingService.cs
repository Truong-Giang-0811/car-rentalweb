using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.Enums;

namespace RentalCarBE.Api.Services;

public class AutoCancelBookingService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AutoCancelBookingService> _logger;

    public AutoCancelBookingService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<AutoCancelBookingService> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                int timeoutMinutes = _configuration.GetValue<int>("Booking:AutoCancelTimeoutMinutes", 15);

                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var cutoffTime = DateTime.UtcNow.AddMinutes(-timeoutMinutes);

                var expiredBookings = await db.Bookings
                    .Where(b => b.Status == BookingStatus.WaitingForDeposit &&
                                b.OwnerAgreedAt.HasValue &&
                                b.OwnerAgreedAt.Value < cutoffTime)
                    .ToListAsync(stoppingToken);

                if (expiredBookings.Any())
                {
                    foreach (var booking in expiredBookings)
                    {
                        booking.Status = BookingStatus.Expired;
                        booking.Note += $"\n[Hệ thống]: Tự động chuyển sang Expired lúc {DateTime.Now:dd/MM/yyyy HH:mm:ss} " +
                                       $"(quá {timeoutMinutes} phút chưa thanh toán)";
                    }

                    await db.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation("Đã tự động chuyển {Count} đơn sang trạng thái Expired.", expiredBookings.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy AutoCancelBookingService");
            }

            // Kiểm tra mỗi 1 phút
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}