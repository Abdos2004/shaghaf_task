using Management.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Management.Features.Users;

[ApiController]
[Route("api/users")]
public sealed class UsersController(ShaghafDbContext database) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await database.Users
            .AsNoTracking()
            .OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName)
            .Select(user => ToResponse(user))
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await database.Users
            .AsNoTracking()
            .Where(user => user.Id == id)
            .Select(user => ToResponse(user))
            .SingleOrDefaultAsync(cancellationToken);

        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var phoneNumber = request.PhoneNumber.Trim();
        if (await database.Users.AnyAsync(user => user.PhoneNumber == phoneNumber, cancellationToken))
        {
            return Conflict(new { error = "A user with this phone number already exists." });
        }

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = phoneNumber
        };

        database.Users.Add(user);
        await database.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { user.Id }, ToResponse(user));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserResponse>> Update(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await database.Users.SingleOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var phoneNumber = request.PhoneNumber.Trim();
        var phoneNumberInUse = await database.Users.AnyAsync(
            otherUser => otherUser.PhoneNumber == phoneNumber && otherUser.Id != id,
            cancellationToken);

        if (phoneNumberInUse)
        {
            return Conflict(new { error = "A user with this phone number already exists." });
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.PhoneNumber = phoneNumber;
        await database.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(user));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var user = await database.Users.SingleOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        database.Users.Remove(user);
        await database.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static UserResponse ToResponse(User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.PhoneNumber,
        user.CreatedAtUtc);
}
