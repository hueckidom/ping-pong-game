namespace PingPong.Repositories
{
    public class RepositoryConfiguration
    {
        public required string ConnectionString { get; set; }
        public const string Position = "SQLiteConfiguration";
    }
}
