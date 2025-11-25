using Microsoft.EntityFrameworkCore;
using SuporteApp.WebAPI.Objects.Enums;
using SuporteApp.WebAPI.Objects.Models;

namespace SuporteApp.WebAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Client)
            .WithMany(u => u.TicketsCreated)
            .HasForeignKey(t => t.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Technician)
            .WithMany(u => u.TicketsAssigned)
            .HasForeignKey(t => t.TechnicianId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Cliente João",
                    Email = "joao@cliente.com",
                    Password = "123",
                    Role = UserRole.Client
                },
                new User
                {
                    Id = 2,
                    Name = "Técnica Maria",
                    Email = "maria@suporte.com",
                    Password = "123",
                    Role = UserRole.Technician
                }
            );

        // Ticket Inicial
        modelBuilder.Entity<Ticket>().HasData(
            new Ticket
            {
                Id = 1,
                Title = "Internet lenta e caindo",
                Description = "Minha conexão cai toda vez que abro o Teams.",
                CreatedAt = DateTime.UtcNow,
                Status = TicketStatus.Open,
                ClientId = 1,
                TechnicianId = null
            }
        );

        // Já deixar uma mensagem inicial no ticket
        modelBuilder.Entity<Message>().HasData(
            new Message
            {
                Id = 1,
                Content = "Olá, estou com esse problema urgente.",
                SentAt = DateTime.UtcNow,
                TicketId = 1,
                SenderId = 1
            }
        );
    }
}
