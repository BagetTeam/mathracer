using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    public async Task JoinLobby(string gameId)
    {
        Player currentPlayer = new Player();

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, new Dictionary<int, Player>());
            currentPlayer.isHost = true;
        }

        Dictionary<int, Player> lobby = lobbies[gameId];

        currentPlayer.id = lobby.Count + 1;

        lobby.Add(currentPlayer.id, currentPlayer);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("NewPlayer", currentPlayer.id, currentPlayer.isHost);

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Groups(gameId).SendAsync("NotifyJoined", $"Player {currentPlayer.id} joined");

        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies.Keys));
        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies[gameId].Keys));
    }
}

public class Player
{
    public int id = 0;
    public int progress = 0;
    public int score = 0;
    public bool isHost = false;
    public string name = "";
}
