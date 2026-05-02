using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalCarBE.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "Bookings",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarLicensePlateSnapshot",
                table: "Bookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CarNameSnapshot",
                table: "Bookings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Collateral",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContractSnapshot",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomerAgreedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CustomerAgreedTerms",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CustomerAgreementReason",
                table: "Bookings",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerNameSnapshot",
                table: "Bookings",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InsurancePerDay",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "OwnerAgreedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "OwnerAgreedTerms",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OwnerAgreementReason",
                table: "Bookings",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Bookings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "OwnerNameSnapshot",
                table: "Bookings",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PickupAddress",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PickupType",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RentalDays",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RentalPapers",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_OwnerId",
                table: "Bookings",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AppUsers_OwnerId",
                table: "Bookings",
                column: "OwnerId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_AppUsers_OwnerId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_OwnerId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CarLicensePlateSnapshot",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CarNameSnapshot",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Collateral",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ContractSnapshot",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerAgreedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerAgreedTerms",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerAgreementReason",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerNameSnapshot",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "InsurancePerDay",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OwnerAgreedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OwnerAgreedTerms",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OwnerAgreementReason",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OwnerNameSnapshot",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PickupAddress",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PickupType",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RentalDays",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RentalPapers",
                table: "Bookings");

            migrationBuilder.AlterColumn<string>(
                name: "Note",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }
    }
}
