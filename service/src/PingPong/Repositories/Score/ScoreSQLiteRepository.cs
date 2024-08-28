using Microsoft.Extensions.Options;
using PingPong.Models;
using System.Data.SQLite;

namespace PingPong.Repositories.Score
{
    public class ScoreSQLiteRepository : IScoreRepository
    {
        private readonly string _sqlitePath;

        public ScoreSQLiteRepository(IOptions<RepositoryConfiguration> options)
        {
            _sqlitePath = options.Value.ConnectionString;
            CreateTable();
        }

        public void CreateTable()
        {
            using (SQLiteConnection connection = new SQLiteConnection(_sqlitePath))
            {
                connection.Open();
                // SQL-Befehl zum Erstellen einer Tabelle
                string createTableQuery = @"CREATE TABLE IF NOT EXISTS PlayerItems (
                PlayerId TEXT PRIMARY KEY,
                SessionId TEXT,
                Playername TEXT,
                Score INTEGER
                ); ";
                // Befehl ausführen
                using (SQLiteCommand command = new SQLiteCommand(createTableQuery, connection))
                {
                    command.ExecuteNonQuery();
                }
            }
        }

        public async Task<PlayerDTO[]> GetScoresAsync()
        {
            var items = new List<PlayerDTO>();

            using (SQLiteConnection connection = new SQLiteConnection(_sqlitePath))
            {
                await connection.OpenAsync();
                var cmd = new SQLiteCommand("SELECT * FROM PlayerItems", connection);
                using (var reader = cmd.ExecuteReader())
                {
                    while (await reader.ReadAsync())
                    {
                        items.Add(new PlayerDTO
                        {
                            Id = Guid.Parse(reader["PlayerId"].ToString()),
                            SessionId = Guid.Parse(reader["SessionId"].ToString()),
                            Score = Convert.ToInt32(reader["Score"]),
                            Name = (string)reader["Playername"]
                        });
                    }
                }
            }
            return items.ToArray();
        }

        public void AddScores(PlayerDTO item)
        {
            using (SQLiteConnection connection = new SQLiteConnection(_sqlitePath))
            {
                connection.Open();
                string insertQuery = "INSERT INTO PlayerItems (PlayerId, SessionId, Playername, Score) VALUES (@PlayerId, @SessionId, @Playername, @Score)";
                using (SQLiteCommand command = new SQLiteCommand(insertQuery, connection))
                {
                    command.Parameters.AddWithValue("@PlayerId", item.Id.ToString());
                    command.Parameters.AddWithValue("@SessionId", item.SessionId.ToString());
                    command.Parameters.AddWithValue("@Playername", item.Name);
                    command.Parameters.AddWithValue("@Score", item.Score);
                    command.ExecuteNonQuery();
                }
            }
        }

        public void DeleteScores()
        {
            using (SQLiteConnection connection = new SQLiteConnection(_sqlitePath))
            {
                using (var conn = new SQLiteConnection(_sqlitePath))
                {
                    conn.Open();
                    var cmd = new SQLiteCommand("DELETE FROM PlayerItems", conn);
                    cmd.ExecuteNonQuery();
                }
            }
        }
    }
}