using System.ComponentModel.DataAnnotations;

namespace Management.Features.Users;

public sealed record UserResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string PhoneNumber,
    DateTime CreatedAtUtc);

public class CreateUserRequest
{
    [Required, StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    [Required, Phone, StringLength(20)]
    public string PhoneNumber { get; init; } = string.Empty;
}

public sealed class UpdateUserRequest : CreateUserRequest;
