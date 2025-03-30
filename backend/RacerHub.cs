using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    Dictionary<string, Player[]> lobbies = new Dictionary<string, Player[]>();

    public async Task JoinLobby(string gameId)
    {
        Player currentPlayer = new Player();

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, []);
            currentPlayer.isHost = true;
        }

        lobbies[gameId].Append<Player>(currentPlayer);

        await Clients.Client(Context.ConnectionId).SendAsync("NewPlayer", currentPlayer);

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Groups(gameId).SendAsync("NotifyJoined", $"Player {1} joined");

        System.Console.WriteLine("hello world");
    }
}

class Player
{
    public int id = 0;
    public int progress = 0;
    public int score = 0;
    public bool isHost = false;
    public string name = "";
}
