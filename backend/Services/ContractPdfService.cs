using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RentalCarBE.Api.Models.Entities;

namespace RentalCarBE.Api.Services;

public interface IContractPdfService
{
    Task<string> GenerateAsync(Booking booking);
}

public class ContractPdfService : IContractPdfService
{
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;

    public ContractPdfService(IWebHostEnvironment env, IHttpContextAccessor http)
    {
        _env = env;
        _http = http;
    }

    public async Task<string> GenerateAsync(Booking booking)
    {
        var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(root, "contracts");
        Directory.CreateDirectory(dir);

        var fileName = $"contract-{booking.Id}.pdf";
        var path = Path.Combine(dir, fileName);

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);

                page.Content().Column(col =>
                {
                    col.Item().Text("HỢP ĐỒNG THUÊ XE").Bold().FontSize(20).AlignCenter();

                    col.Item().Text($"Số hợp đồng: KC-{booking.Id.ToString()[..6]}").AlignCenter();

                    col.Item().PaddingTop(10).Text($"Xe: {booking.CarNameSnapshot}");
                    col.Item().Text($"Khách thuê: {booking.CustomerNameSnapshot}");
                    col.Item().Text($"Chủ xe: {booking.OwnerNameSnapshot}");

                    col.Item().Text($"Nhận xe: {booking.StartAt:dd/MM/yyyy HH:mm}");
                    col.Item().Text($"Trả xe: {booking.EndAt:dd/MM/yyyy HH:mm}");

                    col.Item().Text($"Địa điểm: {booking.PickupAddress}");

                    col.Item().PaddingTop(10)
                        .Text($"Tổng tiền: {booking.TotalAmount:n0} VNĐ").Bold();

                    col.Item().PaddingTop(20).Text("Ký xác nhận").Bold();

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().AlignCenter().Text("BÊN CHO THUÊ").Bold();
                            c.Item().AlignCenter().Text(booking.OwnerNameSnapshot);
                            c.Item().AlignCenter().Text(DateTime.Now.ToString("dd/MM/yyyy"));
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().AlignCenter().Text("BÊN THUÊ").Bold();
                            c.Item().AlignCenter().Text(booking.CustomerNameSnapshot);
                            c.Item().AlignCenter().Text(DateTime.Now.ToString("dd/MM/yyyy"));
                        });
                    });
                });
            });
        }).GeneratePdf();

        await File.WriteAllBytesAsync(path, pdf);

        var req = _http.HttpContext?.Request;
        var baseUrl = $"{req?.Scheme}://{req?.Host}";

        return $"{baseUrl}/contracts/{fileName}";
    }
}