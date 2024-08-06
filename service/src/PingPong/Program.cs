using PingPong.Repositories;
using PingPong.Repositories.Player;
using PingPong.Services.PlayerService;
using PingPong.Services;
using PingPong.Repositories.Score;
using PingPong.Services.ScoreService;
using PingPong.Hubs;

namespace PingPongAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.Configure<RepositoryConfiguration>(builder.Configuration.GetSection(RepositoryConfiguration.Position));

            builder.Services.Configure<AppInformation>(builder.Configuration.GetSection(AppInformation.Position));


            builder.Services.AddTransient<ISessionRepository, SessionRepository>();
            builder.Services.AddTransient<IPlayerRepository, PlayerRepository>();
            builder.Services.AddTransient<IScoreRepository, ScoreSQLiteRepository>();

            builder.Services.AddScoped<SessionService>();
            builder.Services.AddScoped<PlayerService>();
            builder.Services.AddScoped<ScoreService>();

            builder.Services.AddSignalR();

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseRouting();

            // Enable CORS
            app.UseCors(options =>
            {
                options.AllowAnyOrigin()
                       .AllowAnyHeader()
                       .AllowAnyMethod();
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<GameHub>("/hub");
            });

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.MapControllers();

            app.Run();
        }
    }
}