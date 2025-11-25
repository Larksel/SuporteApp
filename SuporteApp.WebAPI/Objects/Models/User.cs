using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using SuporteApp.WebAPI.Objects.Enums;

namespace SuporteApp.WebAPI.Objects.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public ICollection<Ticket>? TicketsCreated { get; set; }
    public ICollection<Ticket>? TicketsAssigned { get; set; }
}
