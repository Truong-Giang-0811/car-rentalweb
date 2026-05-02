using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Data;
using RentalCarBE.Api.Models.DTOs.Bookings;
using RentalCarBE.Api.Models.Entities;
using RentalCarBE.Api.Models.Enums;
using RentalCarBE.Api.Services;
using System.Security.Claims;
using PayOS;
using PayOS.Models;
using PayOS.Models.Webhooks;
using PayOS.Models.V2.PaymentRequests;

namespace RentalCarBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IContractPdfService _pdfService;
    private readonly IConfiguration _configuration;
    private readonly PayOSClient _payOS;

    public BookingsController(AppDbContext db, IContractPdfService pdfService, IConfiguration configuration)
    {
        _db = db;
        _pdfService = pdfService;
        _configuration = configuration;
        // Khởi tạo PayOS client với thông tin từ appsettings.json
        _payOS = new PayOSClient(
            _configuration["PayOS:ClientId"] ?? "",
            _configuration["PayOS:ApiKey"] ?? "",
            _configuration["PayOS:ChecksumKey"] ?? ""
    );
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return Guid.Parse(idStr!);
    }

    private string GenerateContractNumber(Guid bookingId)
    {
        return $"KC-{DateTime.UtcNow:yyyyMMdd}-{bookingId.ToString()[..6].ToUpper()}";
    }

    private string BuildContractSnapshot(Booking b)
    {
        return $@"
HỢP ĐỒNG THUÊ XE

1. THÔNG TIN XE
- Xe: {b.CarNameSnapshot}
- Biển số: {b.CarLicensePlateSnapshot}

2. THÔNG TIN THUÊ
- Thời gian nhận xe: {b.StartAt:dd/MM/yyyy HH:mm}
- Thời gian trả xe: {b.EndAt:dd/MM/yyyy HH:mm}
- Địa điểm nhận xe: {b.PickupAddress}

3. CHI PHÍ
- Giá thuê/ngày: {b.PricePerDay:N0} VNĐ
- Bảo hiểm/ngày: {b.InsurancePerDay:N0} VNĐ
- Số ngày thuê: {b.RentalDays}
- Giảm giá: {b.DiscountAmount:N0} VNĐ
- Tổng tiền: {b.TotalAmount:N0} VNĐ

4. GIẤY TỜ THUÊ XE
- {b.RentalPapers}

5. TÀI SẢN THẾ CHẤP
- {b.Collateral}

6. XÁC NHẬN ĐIỆN TỬ

BÊN CHO THUÊ
- Ký bởi: {b.OwnerNameSnapshot}
- Ngày ký: {(b.OwnerAgreedAt.HasValue ? b.OwnerAgreedAt.Value.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss") : "Chưa xác nhận")}
- Lý do: {b.OwnerAgreementReason ?? "Chưa xác nhận"}

BÊN THUÊ
- Ký bởi: {b.CustomerNameSnapshot}
- Ngày ký: {(b.CustomerAgreedAt.HasValue ? b.CustomerAgreedAt.Value.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss") : "Chưa xác nhận")}
- Lý do: {b.CustomerAgreementReason ?? "Chưa xác nhận"}
";
    }

    // 1. Hàm tạo Link thanh toán PayOS
    [HttpPost("{id:guid}/payos-link")]
    public async Task<IActionResult> CreatePayOSLink(Guid id)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(x => x.Id == id);
        if (booking == null) return NotFound(new { message = "Không tìm thấy đơn đặt xe." });

        if (booking.Status != BookingStatus.WaitingForDeposit)
            return BadRequest(new { message = "Đơn hàng không ở trạng thái chờ thanh toán." });

        try
        {
            long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyyyMMddHHmmss"));
            string description = $"Thanh toan {booking.Id.ToString()[..8].ToUpper()}";

            var paymentRequest = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = (int)booking.TotalAmount,
                Description = description,
                ReturnUrl = "http://localhost:5173/bookings/" + booking.Id,
                CancelUrl = "http://localhost:5173/bookings/" + booking.Id
            };

            var result = await _payOS.PaymentRequests.CreateAsync(paymentRequest);

            booking.Note += $"\n[PayOS-OrderCode]: {orderCode}";
            await _db.SaveChangesAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi PayOS: " + ex.Message });
        }
    }

    [HttpPost("payos-webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> PayOSWebhook([FromBody] Webhook webhookBody)
    {
        try
        {
            var data = await _payOS.Webhooks.VerifyAsync(webhookBody);
            int timeoutMinutes = _configuration.GetValue<int>("Booking:AutoCancelTimeoutMinutes", 15);

            var waitingBookings = await _db.Bookings
                .Where(x => x.Status == BookingStatus.WaitingForDeposit)
                .ToListAsync();

            var targetBooking = waitingBookings
                .FirstOrDefault(x => data.Description.Contains(x.Id.ToString()[..8].ToUpper()));

            if (targetBooking != null)
            {
                // Kiểm tra đã hết hạn chưa
                if (targetBooking.OwnerAgreedAt.HasValue &&
                    targetBooking.OwnerAgreedAt.Value < DateTime.UtcNow.AddMinutes(-timeoutMinutes))
                {
                    return Ok(new { success = false, message = "Đơn đã hết hạn thanh toán." });
                }

                if (data.Amount >= (int)targetBooking.TotalAmount)
                {
                    targetBooking.Status = BookingStatus.Confirmed;
                    targetBooking.Note += $"\n[PayOS]: Thanh toán thành công lúc {DateTime.Now}. GD: {data.PaymentLinkId}";

                    var agreement = await _db.RentalAgreements.FirstOrDefaultAsync(x => x.BookingId == targetBooking.Id);
                    if (agreement != null)
                    {
                        agreement.PdfUrl = await _pdfService.GenerateAsync(targetBooking);
                    }

                    await _db.SaveChangesAsync();
                }
            }

            return Ok(new { success = true });
        }
        catch (Exception)
        {
            return Ok(new { success = false });
        }
    }

    // POST /api/bookings
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        if (!dto.CustomerAgreedTerms)
            return BadRequest(new { message = "Bạn cần đồng ý hợp đồng trước khi gửi yêu cầu." });

        if (dto.CarId == Guid.Empty)
            return BadRequest(new { message = "CarId không hợp lệ." });

        if (dto.StartAt < DateTime.UtcNow)
            return BadRequest(new { message = "Thời gian bắt đầu không được ở quá khứ." });

        if (dto.StartAt >= dto.EndAt)
            return BadRequest(new { message = "Thời gian thuê không hợp lệ." });

        var customerId = GetUserId();

        // Kiểm tra khách đã có đơn đang active với xe này chưa
        var existingBooking = await _db.Bookings.AnyAsync(x =>
            x.CustomerId == customerId &&
            x.CarId == dto.CarId &&
            (x.Status == BookingStatus.WaitingForDeposit ||
             x.Status == BookingStatus.Confirmed ||
             x.Status == BookingStatus.PickedUp));

        if (existingBooking)
            return BadRequest(new { message = "Bạn đã có đơn đang chờ thanh toán hoặc đang thuê xe này." });

        var car = await _db.Cars.FirstOrDefaultAsync(x => x.Id == dto.CarId && x.IsAvailable);
        if (car == null)
            return NotFound(new { message = "Xe không tồn tại hoặc hiện đang bị khóa." });

        var owner = await _db.AppUsers.FirstOrDefaultAsync(x => x.Id == car.OwnerId);
        if (owner == null)
            return BadRequest(new { message = "Không tìm thấy chủ xe." });

        if (owner.Id == customerId)
            return BadRequest(new { message = "Bạn không thể tự thuê xe của chính mình." });

        // ==================== KIỂM TRA TRÙNG LỊCH ====================
        var isOverlapped = await _db.Bookings.AnyAsync(b =>
            b.CarId == dto.CarId &&
            (b.Status == BookingStatus.WaitingForDeposit ||
             b.Status == BookingStatus.Confirmed ||
             b.Status == BookingStatus.PickedUp) &&
            dto.StartAt < b.EndAt &&
            dto.EndAt > b.StartAt);

        if (isOverlapped)
            return BadRequest(new { message = "Xe đã có lịch được đặt trong khoảng thời gian này." });

        var customer = await _db.AppUsers.FirstOrDefaultAsync(x => x.Id == customerId);
        if (customer == null)
            return Unauthorized(new { message = "Không tìm thấy thông tin người thuê." });

        var rentalDays = (decimal)(dto.EndAt - dto.StartAt).TotalDays;
        if (rentalDays < 1) rentalDays = 1;

        var calculatedTotal = (car.PricePerDay + dto.InsurancePerDay) * (decimal)Math.Ceiling(rentalDays) - dto.DiscountAmount;

        // ==================== TẠO BOOKING ====================
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CarId = car.Id,
            CustomerId = customer.Id,
            OwnerId = owner.Id,

            StartAt = dto.StartAt,
            EndAt = dto.EndAt,

            PickupType = dto.PickupType,
            PickupAddress = string.IsNullOrWhiteSpace(dto.PickupAddress) ? car.Address : dto.PickupAddress.Trim(),

            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),

            PricePerDay = dto.PricePerDay,
            InsurancePerDay = dto.InsurancePerDay,
            RentalDays = (int)Math.Ceiling(rentalDays),
            DiscountAmount = dto.DiscountAmount,
            TotalAmount = calculatedTotal,

            RentalPapers = dto.RentalPapers,
            Collateral = dto.Collateral,

            CarNameSnapshot = $"{car.Brand} {car.Model} {car.Year}",
            CarLicensePlateSnapshot = car.LicensePlate,

            CustomerNameSnapshot = customer.FullName,
            OwnerNameSnapshot = owner.FullName,

            CustomerAgreedTerms = true,
            CustomerAgreedAt = DateTime.UtcNow,
            CustomerAgreementReason = "Tôi đồng ý thuê xe",

            // === TỰ ĐỘNG DUYỆT CHO CHỦ XE ===
            OwnerAgreedTerms = true,
            OwnerAgreedAt = DateTime.UtcNow,
            OwnerAgreementReason = "Hệ thống tự động xác nhận để khách thanh toán ngay",

            Status = BookingStatus.WaitingForDeposit,
            CreatedAt = DateTime.UtcNow
        };

        booking.ContractSnapshot = BuildContractSnapshot(booking);

        // Tạo RentalAgreement luôn
        var contractNumber = GenerateContractNumber(booking.Id);
        var pdfUrl = await _pdfService.GenerateAsync(booking);

        var agreement = new RentalAgreement
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            AgreementContent = booking.ContractSnapshot,
            CustomerAccepted = true,
            CustomerAcceptedAt = booking.CustomerAgreedAt,
            OwnerAccepted = true,
            OwnerAcceptedAt = booking.OwnerAgreedAt,
            ContractNumber = contractNumber,
            PdfUrl = pdfUrl,
            CreatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);
        _db.RentalAgreements.Add(agreement);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            booking.Id,
            message = "Đơn đặt xe đã được tạo thành công. Vui lòng thanh toán để giữ chỗ.",
            status = BookingStatus.WaitingForDeposit.ToString()
        });
    }

    // GET /api/bookings/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings()
    {
        var customerId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var data = await _db.Bookings
            .AsNoTracking()
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.CarId,
                x.CarNameSnapshot,
                x.CarLicensePlateSnapshot,
                x.StartAt,
                x.EndAt,
                x.TotalAmount,
                x.Status,
                x.CreatedAt,

                // tên chủ xe
                x.OwnerNameSnapshot,

                // ảnh xe
                Thumbnail = _db.CarImages
                    .Where(i => i.CarId == x.CarId && (int)i.Type >= 0 && (int)i.Type <= 3)
                    .OrderBy(i => i.Type)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault(),

                // link pdf hợp đồng
                ContractPdfUrl = _db.RentalAgreements
                    .Where(r => r.BookingId == x.Id)
                    .Select(r => r.PdfUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var result = data.Select(x => new
        {
            x.Id,
            x.CarId,
            x.CarNameSnapshot,
            x.CarLicensePlateSnapshot,
            x.StartAt,
            x.EndAt,
            x.TotalAmount,
            Status = x.Status.ToString(),
            x.CreatedAt,
            OwnerName = x.OwnerNameSnapshot,

            Thumbnail = string.IsNullOrWhiteSpace(x.Thumbnail)
                ? null
                : (x.Thumbnail.StartsWith("http")
                    ? x.Thumbnail
                    : $"{baseUrl}{x.Thumbnail}"),

            ContractPdfUrl = string.IsNullOrWhiteSpace(x.ContractPdfUrl)
                ? null
                : (x.ContractPdfUrl.StartsWith("http")
                    ? x.ContractPdfUrl
                    : $"{baseUrl}{x.ContractPdfUrl}")
        });

        return Ok(result);
    }

    // GET /api/bookings/owner
    [HttpGet("owner")]
    public async Task<IActionResult> GetOwnerBookings()
    {
        var ownerId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var data = await _db.Bookings
            .AsNoTracking()
            .Where(x => x.OwnerId == ownerId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.CarId,
                x.CarNameSnapshot,
                x.CarLicensePlateSnapshot,
                x.CustomerNameSnapshot,
                x.StartAt,
                x.EndAt,
                x.TotalAmount,
                x.Status,
                x.CreatedAt,
                x.Note,

                Thumbnail = _db.CarImages
                    .Where(i => i.CarId == x.CarId && (int)i.Type >= 0 && (int)i.Type <= 3)
                    .OrderBy(i => i.Type)
                    .ThenBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var result = data.Select(x => new
        {
            x.Id,
            x.CarId,
            x.CarNameSnapshot,
            x.CarLicensePlateSnapshot,
            x.CustomerNameSnapshot,
            x.StartAt,
            x.EndAt,
            x.TotalAmount,
            x.Status,
            x.CreatedAt,
            x.Note,
            Thumbnail = string.IsNullOrWhiteSpace(x.Thumbnail)
                ? null
                : $"{baseUrl}{x.Thumbnail}"
        });

        return Ok(result);
    }

    // GET /api/bookings/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBookingDetail(Guid id)
    {
        var userId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var booking = await _db.Bookings
            .AsNoTracking()
            .Where(x => x.Id == id && (x.CustomerId == userId || x.OwnerId == userId))
            .Select(x => new
            {
                x.Id,
                x.CarId,
                x.CarNameSnapshot,
                x.CarLicensePlateSnapshot,
                x.CustomerNameSnapshot,
                x.OwnerNameSnapshot,
                x.StartAt,
                x.EndAt,
                x.PickupAddress,
                x.PickupType,
                x.Note,
                x.PricePerDay,
                x.InsurancePerDay,
                x.RentalDays,
                x.DiscountAmount,
                x.TotalAmount,
                x.RentalPapers,
                x.Collateral,
                x.ContractSnapshot,
                x.Status,
                x.CreatedAt,
                x.CustomerAgreedTerms,
                x.CustomerAgreedAt,
                x.CustomerAgreementReason,
                x.OwnerAgreedTerms,
                x.OwnerAgreedAt,
                x.OwnerAgreementReason,

                ContractPdfUrl = _db.RentalAgreements
                    .Where(r => r.BookingId == x.Id)
                    .Select(r => r.PdfUrl)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (booking == null)
            return NotFound(new { message = "Không tìm thấy đơn thuê." });

        return Ok(new
        {
            booking.Id,
            booking.CarId,
            booking.CarNameSnapshot,
            booking.CarLicensePlateSnapshot,
            booking.CustomerNameSnapshot,
            booking.OwnerNameSnapshot,
            booking.StartAt,
            booking.EndAt,
            booking.PickupAddress,
            booking.PickupType,
            booking.Note,
            booking.PricePerDay,
            booking.InsurancePerDay,
            booking.RentalDays,
            booking.DiscountAmount,
            booking.TotalAmount,
            booking.RentalPapers,
            booking.Collateral,
            booking.ContractSnapshot,
            Status = booking.Status.ToString(),
            booking.CreatedAt,
            booking.CustomerAgreedTerms,
            booking.CustomerAgreedAt,
            booking.CustomerAgreementReason,
            booking.OwnerAgreedTerms,
            booking.OwnerAgreedAt,
            booking.OwnerAgreementReason,

            ContractPdfUrl = string.IsNullOrWhiteSpace(booking.ContractPdfUrl)
                ? null
                : (booking.ContractPdfUrl.StartsWith("http")
                    ? booking.ContractPdfUrl
                    : $"{baseUrl}{booking.ContractPdfUrl}")
        });
    }

    // POST /api/bookings/{id}/approve
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> ApproveBooking(Guid id)
    {
        var ownerId = GetUserId();

        // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var booking = await _db.Bookings
                .Include(b => b.Car) // Load thông tin xe để kiểm tra
                .FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == ownerId);

            if (booking == null)
                return NotFound(new { message = "Không tìm thấy đơn thuê." });

            if (booking.Status != BookingStatus.Pending)
                return BadRequest(new { message = "Chỉ có thể duyệt đơn đang ở trạng thái chờ." });

            // --- BỔ SUNG QUAN TRỌNG: CHECK LẠI TRÙNG LỊCH TRƯỚC KHI DUYỆT ---
            var isStillAvailable = !await _db.Bookings.AnyAsync(b =>
                b.CarId == booking.CarId &&
                b.Id != booking.Id &&
                (b.Status == BookingStatus.WaitingForDeposit || b.Status == BookingStatus.Confirmed) && // ĐỔI Approved
                booking.StartAt < b.EndAt &&
                booking.EndAt > b.StartAt);

            if (!isStillAvailable)
            {
                return BadRequest(new { message = "Không thể duyệt vì lịch xe đã bị trùng với một đơn khác vừa được xác nhận." });
            }

            // Cập nhật thông tin phê duyệt
            booking.Status = BookingStatus.WaitingForDeposit;
            booking.OwnerAgreedTerms = true;
            booking.OwnerAgreedAt = DateTime.UtcNow;
            booking.OwnerAgreementReason = "Chủ xe đã duyệt, vui lòng thanh toán để hoàn tất.";

            // Build lại snapshot vì lúc này đã có thông tin OwnerAgreedAt
            booking.ContractSnapshot = BuildContractSnapshot(booking);

            // Xử lý RentalAgreement 
            var contractNumber = GenerateContractNumber(booking.Id);
            var pdfUrl = await _pdfService.GenerateAsync(booking);

            var agreement = await _db.RentalAgreements
                .FirstOrDefaultAsync(x => x.BookingId == booking.Id);

            if (agreement == null)
            {
                agreement = new RentalAgreement
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    AgreementContent = booking.ContractSnapshot,
                    CustomerAccepted = booking.CustomerAgreedTerms,
                    CustomerAcceptedAt = booking.CustomerAgreedAt,
                    OwnerAccepted = true,
                    OwnerAcceptedAt = booking.OwnerAgreedAt,
                    ContractNumber = contractNumber,
                    PdfUrl = pdfUrl,
                    CreatedAt = DateTime.UtcNow
                };
                _db.RentalAgreements.Add(agreement);
            }
            else
            {
                agreement.AgreementContent = booking.ContractSnapshot;
                agreement.OwnerAccepted = true;
                agreement.OwnerAcceptedAt = booking.OwnerAgreedAt;
                agreement.ContractNumber = contractNumber;
                agreement.PdfUrl = pdfUrl;
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync(); // Hoàn tất giao dịch

            return Ok(new { message = "Đã duyệt đơn. Đang chờ khách hàng thanh toán.", pdfUrl });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(); // Có lỗi thì trả dữ liệu về trạng thái cũ
            return StatusCode(500, new { message = "Có lỗi xảy ra trong quá trình duyệt đơn." });
        }
    }

    // POST /api/bookings/{id}/reject
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> RejectBooking(Guid id)
    {
        var ownerId = GetUserId();

        var booking = await _db.Bookings.FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == ownerId);
        if (booking == null)
            return NotFound(new { message = "Không tìm thấy đơn thuê." });

        if (booking.Status != BookingStatus.Pending)
            return BadRequest(new { message = "Chỉ có thể từ chối đơn đang chờ." });

        booking.Status = BookingStatus.Rejected;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã từ chối đơn thuê." });
    }

    // GET /api/bookings/owner/contracts
    [HttpGet("owner/contracts")]
    public async Task<IActionResult> GetOwnerContracts()
    {
        var ownerId = GetUserId();

        var data = await _db.RentalAgreements
            .AsNoTracking()
            .Where(x => x.Booking != null && x.Booking.OwnerId == ownerId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
               
                x.BookingId,
                x.ContractNumber,
                x.PdfUrl,
                x.CreatedAt,
                CarName = x.Booking!.CarNameSnapshot,
                CustomerName = x.Booking.CustomerNameSnapshot,
                StartAt = x.Booking.StartAt,
                EndAt = x.Booking.EndAt,
                TotalAmount = x.Booking.TotalAmount
            })
            .ToListAsync();

        return Ok(data);
    }

    // POST /api/bookings/{id}/pick-up
    [HttpPost("{id:guid}/pick-up")]
    public async Task<IActionResult> ConfirmPickUp(Guid id)
    {
        var ownerId = GetUserId();
        var booking = await _db.Bookings.FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == ownerId);

        if (booking == null)
            return NotFound(new { message = "Không tìm thấy đơn thuê." });

        // Kiểm tra: Chỉ cho nhận xe khi đơn đã được thanh toán thành công
        if (booking.Status != BookingStatus.Confirmed)
            return BadRequest(new { message = "Đơn hàng chưa hoàn tất thanh toán hoặc không ở trạng thái sẵn sàng bàn giao." });

        var originalDuration = booking.EndAt - booking.StartAt;

        // Cập nhật thời gian thực tế bắt đầu lăn bánh
        booking.StartAt = DateTime.UtcNow;
        booking.EndAt = booking.StartAt.Add(originalDuration);

        // Chuyển sang trạng thái "Đang thuê"
        booking.Status = BookingStatus.PickedUp;

        booking.Note += $"\n[Hệ thống]: Xác nhận bàn giao thực tế lúc {booking.StartAt.ToLocalTime():dd/MM/yyyy HH:mm}.";

        booking.ContractSnapshot = BuildContractSnapshot(booking);

        // Cập nhật lại bản PDF hợp đồng chính thức có ngày giờ nhận xe thực tế
        var agreement = await _db.RentalAgreements.FirstOrDefaultAsync(x => x.BookingId == booking.Id);
        if (agreement != null)
        {
            agreement.AgreementContent = booking.ContractSnapshot;
            agreement.PdfUrl = await _pdfService.GenerateAsync(booking);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Bàn giao xe thành công. Chuyến đi bắt đầu!",
            newStartAt = booking.StartAt,
            newEndAt = booking.EndAt
        });
    }

    // POST /api/bookings/{id}/complete
    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteBooking(Guid id)
    {
        var ownerId = GetUserId();

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == ownerId);

        if (booking == null)
            return NotFound(new { message = "Không tìm thấy đơn thuê." });

        if (booking.Status != BookingStatus.PickedUp)
            return BadRequest(new { message = "Chỉ có thể hoàn thành đơn thuê đang ở trạng thái 'Đang dùng'." });

        // cập nhật trạng thái
        booking.Status = BookingStatus.Completed;

        // cập nhật thời gian trả thực tế
        booking.EndAt = DateTime.UtcNow;

        // ghi chú hệ thống
        booking.Note += $"\n[Hệ thống]: Xác nhận khách đã trả xe thành công vào lúc: {booking.EndAt.ToLocalTime():dd/MM/yyyy HH:mm}.";

        // build lại snapshot hợp đồng với thời gian mới
        booking.ContractSnapshot = BuildContractSnapshot(booking);

        // cập nhật agreement + generate lại pdf
        var agreement = await _db.RentalAgreements
            .FirstOrDefaultAsync(x => x.BookingId == booking.Id);

        if (agreement != null)
        {
            agreement.AgreementContent = booking.ContractSnapshot;

            var pdfUrl = await _pdfService.GenerateAsync(booking);
            agreement.PdfUrl = pdfUrl;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Đã xác nhận hoàn thành đơn thuê. Xe đã được bàn giao lại cho chủ xe.",
            status = booking.Status
        });
    }

    // POST /api/bookings/sepay-webhook
    [HttpPost("sepay-webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookDto data)
    {
        try
        {
            string content = data.Content?.ToString().ToUpper() ?? "";
            decimal amount = data.TransferAmount;

            // Tìm đơn hàng dựa trên việc nội dung chuyển khoản CÓ CHỨA 8 ký tự đầu của ID
            // Cách này an toàn hơn Substring
            var booking = await _db.Bookings
                .Where(x => x.Status == BookingStatus.WaitingForDeposit)
                .ToListAsync(); // Lấy danh sách chờ thanh toán ra để so khớp

            var targetBooking = booking.FirstOrDefault(x =>
                content.Contains(x.Id.ToString()[..8].ToUpper()));

            if (targetBooking == null) return Ok(new { message = "Không tìm thấy đơn hàng" });

            if (amount >= targetBooking.TotalAmount)
            {
                targetBooking.Status = BookingStatus.Confirmed;
                targetBooking.Note += $"\n[SePay]: Tự động xác nhận thanh toán thành công lúc {DateTime.Now}.";

                var agreement = await _db.RentalAgreements.FirstOrDefaultAsync(x => x.BookingId == targetBooking.Id);
                if (agreement != null)
                {
                    agreement.PdfUrl = await _pdfService.GenerateAsync(targetBooking);
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/bookings/{id}/payment-qr
    [HttpGet("{id:guid}/payment-qr")]
    public async Task<IActionResult> GetPaymentQr(Guid id)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(x => x.Id == id);
        if (booking == null) return NotFound(new { message = "Không tìm thấy đơn đặt xe." });

        // Lấy thông tin từ PaymentConfig trong appsettings.json
        string bankId = _configuration["PaymentConfig:BankId"];
        string accountNo = _configuration["PaymentConfig:AccountNo"];
        string accountName = _configuration["PaymentConfig:AccountName"];
        string bankName = _configuration["PaymentConfig:BankName"];

        // Nội dung chuyển khoản
        string description = $"THANH TOAN DON {booking.Id.ToString()[..8].ToUpper()}";

        // Tạo link QR (Sử dụng mẫu compact của VietQR)
        string qrUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact.png" +
                       $"?amount={booking.TotalAmount}" +
                       $"&addInfo={Uri.EscapeDataString(description)}" +
                       $"&accountName={Uri.EscapeDataString(accountName)}";

        return Ok(new
        {
            qrUrl,
            amount = booking.TotalAmount,
            description,
            bankName,
            accountNo,
            accountName
        });
    }
}