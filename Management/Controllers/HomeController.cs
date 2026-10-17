using Microsoft.AspNetCore.Mvc;

namespace Management.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Online",
            message = "Management API is running",
            timestamp = DateTime.UtcNow
        });
    }
}
