using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();

    public async Task JoinLobby(string gameId)
    {   
        Player currentPlayer = new Player();
        Lobby lobby = new Lobby(gameId, new Dictionary<int, Player>());

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, lobby);
            currentPlayer.isHost = true;
        }
        else {
            lobby = lobbies[gameId];
        }
        currentPlayer.id = lobby.players.Count + 1;

        lobby.players.Add(currentPlayer.id, currentPlayer);
        // lobbies[gameId].Append<Player>(currentPlayer);

        await Clients.Client(Context.ConnectionId).SendAsync("NewPlayer", currentPlayer);

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Groups(gameId).SendAsync("NotifyJoined", $"Player {1} joined");

        System.Console.WriteLine("hello world");
        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies.Keys));
        System.Console.WriteLine("[{0}]", string.Join(", ", lobby.players.Keys));
    }

    public async Task removePlayerOrLobby(string gameId, Player player) {
        Lobby lobby = lobbies[gameId];
        if (lobby.players.Count == 0) {
            lobbies.Remove(gameId);
            return;
        }
        lobby.players.Remove(player.id);
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

public class Lobby {
    public string gameId = "";
    public Dictionary<int, Player> players = new Dictionary<int, Player>();

    public Lobby(string gameId, Dictionary<int, Player> players)
    {
        this.gameId = gameId;
        this.players = players;
    }
}
