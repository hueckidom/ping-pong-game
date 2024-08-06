using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PingPongAPI;

namespace PingPong.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private readonly AppInformation _appInformation;

        public AppController(IOptions<AppInformation> options)
        {
            _appInformation = options.Value;
        }

        [HttpGet("Version")]
        public async Task<IActionResult> Version()
        {
            return Ok(_appInformation.Version);
        }
    }
}