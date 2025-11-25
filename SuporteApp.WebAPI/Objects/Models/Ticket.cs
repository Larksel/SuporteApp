using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SuporteApp.WebAPI.Objects.Enums;

namespace SuporteApp.WebAPI.Objects.Models;

public class Ticket
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public int ClientId { get; set; }
    [ForeignKey("ClientId")]
    public User? Client { get; set; }

    public int? TechnicianId { get; set; }
    [ForeignKey("TechnicianId")]
    public User? Technician { get; set; }

    // Histórico do Chat
    public ICollection<Message>? Messages { get; set; }
}
