using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    private async Task SyncPlayers(string gameId)
    {
        Dictionary<int, Player> lobby = lobbies[gameId];
        string json = JsonSerializer.Serialize(lobby.Values);
        await Clients.Groups(gameId).SendAsync("SyncPlayers", json);
    }

    public async Task JoinLobby(string gameId, string name)
    {
        Player currentPlayer = new Player(name);

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, new Dictionary<int, Player>());
            currentPlayer.isHost = true;
        }

        Dictionary<int, Player> lobby = lobbies[gameId];

        currentPlayer.id = lobby.Count + 1;

        while (lobby.ContainsKey(currentPlayer.id))
        {
            currentPlayer.id = lobby.Count + 1;
        }

        lobby.Add(currentPlayer.id, currentPlayer);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", JsonSerializer.Serialize(currentPlayer));

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "{0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async void RemovePlayer(string gameId, int id)
    {
        System.Console.WriteLine(
            "{0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );

        if (!lobbies.ContainsKey(gameId))
        {
            return;
        }

        var lobby = lobbies[gameId];

        if (!lobby.ContainsKey(id))
        {
            return;
        }

        Player p = lobby[id];
        lobby.Remove(id);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);

        if (lobby.Count == 0)
        {
            lobbies.Remove(gameId);
            return;
        }

        // TODO: change host if host leaves
        // if (p.isHost) {}

        await SyncPlayers(gameId);
    }

    public async Task StartGame(string gameId, string mode)
    {
        GameMode selectedMode = JsonSerializer.Deserialize<GameMode>(mode)!;
        Equation[] equations = Equation.GenerateAllEquations(
            selectedMode.count * (selectedMode.type == "time" ? 10 : 1)
        );

        await Clients
            .Groups(gameId)
            .SendAsync("StartCountdown", JsonSerializer.Serialize(equations));

        int count = 3;
        DateTime now = DateTime.Now;
        int elapsed = 1;
        while (count >= 0)
        {
            if (elapsed >= 1)
            {
                await Clients.Groups(gameId).SendAsync("CountDown", count);
                elapsed = 0;
                now = DateTime.Now;
                count--;
            }

            elapsed = (DateTime.Now - now).Seconds;
        }

        await Clients.Groups(gameId).SendAsync("GameStart");

        if (selectedMode.type != "time")
        {
            return;
        }

        int time = 0;
        elapsed = 0;
        bool run = true;
        while (run)
        {
            if (elapsed >= 1)
            {
                time++;
                await Clients.Groups(gameId).SendAsync("TimeElapsed", time);
                elapsed = 0;
                now = DateTime.Now;
            }

            elapsed = (DateTime.Now - now).Seconds;

            if (time > selectedMode.count)
            {
                run = false;
            }
        }
    }

    public async Task UpdateScore(string gameId, int playerId, int score)
    {
        var lobby = lobbies[gameId];
        var player = lobby[playerId];
        player.score = score;

        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "UpdateScore {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }
}
