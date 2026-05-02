using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalCarBE.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoriteCars : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FavoriteCars",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteCars", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteCars_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FavoriteCars_Cars_CarId",
                        column: x => x.CarId,
                        principalTable: "Cars",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteCars_CarId",
                table: "FavoriteCars",
                column: "CarId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteCars_UserId_CarId",
                table: "FavoriteCars",
                columns: new[] { "UserId", "CarId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteCars");
        }
    }
}
