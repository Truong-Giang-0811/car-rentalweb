namespace RentalCarBE.Api.Models.DTOs.Cars;

public class AddCarImageDto
{
    public string Url { get; set; } = "";
    public int Type { get; set; }
    public int SortOrder { get; set; } = 0;
}