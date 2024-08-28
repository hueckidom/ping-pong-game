using PingPong.Models;
using PingPong.Repositories.Score;

namespace PingPong.Services.ScoreService
{
    public class ScoreService
    {
        private readonly IScoreRepository _pingPongRepository;

        public ScoreService(IScoreRepository pingPongRepository)
        {
            _pingPongRepository = pingPongRepository;
        }

        public async Task<PlayerDTO[]> GetScoresAsync()
        {
            return await _pingPongRepository.GetScoresAsync();
        }

        public void AddScores(PlayerDTO newScore)
        {
            _pingPongRepository.AddScores(newScore);
        }

        public void DeleteScores()
        {
            _pingPongRepository.DeleteScores();
        }
    }
}