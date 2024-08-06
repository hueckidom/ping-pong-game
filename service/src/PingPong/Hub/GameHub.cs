using Microsoft.AspNetCore.SignalR;
using PingPong.Models;
using PingPong.Models.HubItems;
using PingPong.Models.PlayerIngameModel; 
using PingPong.Models.PlayerPosition;

namespace PingPong.Hubs
{
    public class GameHub : Hub

    //Das 'RS' zeichen in Postman == Record Separator ( ASCII-Zeichen 30,hexadezimal 0x1E). HIER RAUSKOPIEREN --->  
    {

        
        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("Receive Message", $" {Context.ConnectionId} has connected");
        }

        public async Task JoinLobby(Guid sessionId)
        {
            string groupName = sessionId.ToString();
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has joined the lobby {groupName}");
        }

        public async Task LeaveLobby(Guid sessionId)
        {
            string groupName = sessionId.ToString();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has left the lobby {groupName}");
        }

        public async Task DetectPlayerMovement(Guid sessionId, PlayerPosition playerPosition)
        {
            string groupName = sessionId.ToString();
            await Clients.Group(groupName).SendAsync("ReceivePlayerMovement", playerPosition.PlayerId, playerPosition.X, playerPosition.Y);
        }

        public async Task DetectPlayerSize(Guid sessionId, PlayerPosition playerSize)
        {
            string groupName = sessionId.ToString();
            Guid.Parse(playerSize.PlayerId.ToString());
            await Clients.Group(groupName).SendAsync("Received" + playerSize.X, playerSize.Y);
        }

        public async Task DetectPlayerScoreAndLife(Guid sessionId, PlayerScoreAndLife scoreAndLife)
        {
            string groupName = sessionId.ToString();
            await Clients.Group(groupName).SendAsync("Received" + scoreAndLife.Score, scoreAndLife.Life);
        }

        public async Task DetectCurrentQuestion(Guid sessionId, QuestionItem currentQuestionId)
        {
            string groupName = sessionId.ToString();
            Guid.Parse(currentQuestionId.QuestionId.ToString());
            await Clients.Group(groupName).SendAsync("Received" + currentQuestionId.QuestionId);
        }

        public async Task DetectBallMovement(Guid sessionId, BallPosition ballPosition)
        {
            string groupName = sessionId.ToString();
            await Clients.Group(groupName).SendAsync("Received" + ballPosition.X, ballPosition.Y);
        }

        public async Task DetectBallSize(Guid sessionId, BallSize ballSize)
        {
            string groupName = sessionId.ToString();
            await Clients.Group(groupName).SendAsync("Received" + ballSize.Width, ballSize.Height);
        }
    }
}