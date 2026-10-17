using Management.Data;
using Microsoft.EntityFrameworkCore;

LoadEnvironmentFile(FindEnvironmentFile());

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<ShaghafDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Shaghaf")));

// Configure CORS for React frontend development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// This service is API-only. A normal browser navigation asks for HTML, which
// this application never serves. Reject it before routing to API endpoints.
app.Use(async (context, next) =>
{
    var acceptsHtml = context.Request.Headers.Accept.Any(value =>
        value?.Contains("text/html", StringComparison.OrdinalIgnoreCase) == true);

    if (acceptsHtml)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Unauthorized access",
            message = "This host exposes an API only."
        });
        return;
    }

    await next();
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();

static void LoadEnvironmentFile(string path)
{
    if (!File.Exists(path))
    {
        return;
    }

    foreach (var line in File.ReadLines(path))
    {
        var entry = line.Trim();
        if (entry.Length == 0 || entry.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = entry.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = entry[..separatorIndex].Trim();
        var value = entry[(separatorIndex + 1)..].Trim().Trim('"');

        // Deployment environment variables take precedence over local values.
        if (Environment.GetEnvironmentVariable(key) is null)
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

static string FindEnvironmentFile()
{
    var startDirectories = new[]
    {
        Directory.GetCurrentDirectory(),
        AppContext.BaseDirectory
    };

    foreach (var startDirectory in startDirectories)
    {
        var directory = new DirectoryInfo(startDirectory);
        while (directory is not null)
        {
            var localProjectFile = Path.Combine(directory.FullName, "Management.csproj");
            if (File.Exists(localProjectFile))
            {
                return Path.Combine(directory.FullName, ".env");
            }

            var projectDirectory = Path.Combine(directory.FullName, "Management");
            if (File.Exists(Path.Combine(projectDirectory, "Management.csproj")))
            {
                return Path.Combine(projectDirectory, ".env");
            }

            directory = directory.Parent;
        }
    }

    // Preserve a predictable location in error messages when the local file has
    // not been created yet.
    return Path.Combine(Directory.GetCurrentDirectory(), "Management", ".env");
}
