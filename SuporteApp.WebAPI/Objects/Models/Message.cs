using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SuporteApp.WebAPI.Objects.Models;

public class Message
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public int TicketId { get; set; }
    [JsonIgnore]
    public Ticket? Ticket { get; set; }

    public int SenderId { get; set; }
    public User? Sender { get; set; }
}
