using System.Globalization;
using System.Text;

namespace RentalCarBE.Api.Helpers;

public static class StringHelper
{
    public static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        text = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in text)
        {
            var uc = Char.GetUnicodeCategory(c);
            if (uc != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}