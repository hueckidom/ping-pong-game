using Microsoft.AspNetCore.Mvc;
using PingPong.Models;
using PingPong.Services.ScoreService;

namespace PingPong.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScoreController : ControllerBase
    {
        private readonly ScoreService _scoreService;

        public ScoreController(ScoreService scoreService)
        {
            _scoreService = scoreService;
        }
        
        [HttpDelete(nameof(DeleteScores))]
        public IActionResult DeleteScores()
        {
            try
            {
                _scoreService.DeleteScores();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet(nameof(GetScores))]
        public async Task <IActionResult> GetScores()
        {
            try
            {
                return Ok(await _scoreService.GetScoresAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost(nameof(AddScores))]
        public IActionResult AddScores(PlayerDTO newScore)
        {
            try
            {
                _scoreService.AddScores(newScore);
                return Created();
            }
            catch (ArgumentException ex) //ArgumentException f�r 400er Fehler
            {
                return StatusCode(StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (Exception ex) //Exception �berbegriff
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}