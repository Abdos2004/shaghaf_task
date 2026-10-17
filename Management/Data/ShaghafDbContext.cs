using Microsoft.EntityFrameworkCore;
using Management.Features.Users;

namespace Management.Data;

public sealed class ShaghafDbContext(DbContextOptions<ShaghafDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.PhoneNumber).IsUnique();
            entity.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.PhoneNumber).HasMaxLength(20).IsRequired();
        });
    }
}
