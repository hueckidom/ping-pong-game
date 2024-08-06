using PingPong.Models;

namespace PingPong.Repositories.Score
{
    public interface IScoreRepository
    {
        Task<PlayerDTO[]> GetScoresAsync();

        void AddScores(PlayerDTO newScores);

    }
}
