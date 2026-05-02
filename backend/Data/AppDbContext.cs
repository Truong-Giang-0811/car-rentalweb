using Microsoft.EntityFrameworkCore;
using RentalCarBE.Api.Models.Entities;

namespace RentalCarBE.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarImage> CarImages => Set<CarImage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<RentalAgreement> RentalAgreements => Set<RentalAgreement>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<PostComment> PostComments => Set<PostComment>();
    public DbSet<FavoriteCar> FavoriteCars => Set<FavoriteCar>();
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<UserVoucher> UserVouchers { get; set; }
    public DbSet<RewardPointAccount> RewardPointAccounts { get; set; }
    public DbSet<RewardSpinHistory> RewardSpinHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique email
        modelBuilder.Entity<AppUser>()
            .HasIndex(x => x.Email)
            .IsUnique();

        // Unique license plate
        modelBuilder.Entity<Car>()
            .HasIndex(x => x.LicensePlate)
            .IsUnique();

        // Booking 1-1 RentalAgreement
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.RentalAgreement)
            .WithOne(a => a.Booking)
            .HasForeignKey<RentalAgreement>(a => a.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking -> Car
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Car)
            .WithMany()
            .HasForeignKey(b => b.CarId)
            .OnDelete(DeleteBehavior.NoAction);

        // Booking -> Customer
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Customer)
            .WithMany()
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        // Booking -> Owner
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Owner)
            .WithMany()
            .HasForeignKey(b => b.OwnerId)
            .OnDelete(DeleteBehavior.NoAction);

        // ConversationParticipant: 1 user chỉ xuất hiện 1 lần trong 1 conversation
        modelBuilder.Entity<ConversationParticipant>()
            .HasIndex(x => new { x.ConversationId, x.UserId })
            .IsUnique();

        // PostLike: 1 user chỉ like 1 post 1 lần
        modelBuilder.Entity<PostLike>()
            .HasIndex(x => new { x.PostId, x.UserId })
            .IsUnique();

        // Post -> Author
        modelBuilder.Entity<Post>()
            .HasOne(p => p.Author)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // PostComment -> Post
        modelBuilder.Entity<PostComment>()
            .HasOne(pc => pc.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(pc => pc.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        // PostComment -> User
        modelBuilder.Entity<PostComment>()
            .HasOne(pc => pc.User)
            .WithMany(u => u.PostComments)
            .HasForeignKey(pc => pc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // PostLike -> Post
        modelBuilder.Entity<PostLike>()
            .HasOne(pl => pl.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(pl => pl.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        // PostLike -> User
        modelBuilder.Entity<PostLike>()
            .HasOne(pl => pl.User)
            .WithMany(u => u.PostLikes)
            .HasForeignKey(pl => pl.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // FavoriteCar -> User
        modelBuilder.Entity<FavoriteCar>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // FavoriteCar -> Car
        modelBuilder.Entity<FavoriteCar>()
            .HasOne(x => x.Car)
            .WithMany()
            .HasForeignKey(x => x.CarId)
            .OnDelete(DeleteBehavior.Cascade);

        // 1 user chỉ yêu thích 1 xe 1 lần
        modelBuilder.Entity<FavoriteCar>()
            .HasIndex(x => new { x.UserId, x.CarId })
            .IsUnique();
    }
}