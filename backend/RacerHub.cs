using System.Collections;
using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();
    private static Dictionary<string, PublicGame> publicLobbies = new Dictionary<string, PublicGame>();

    private async Task SyncPlayers(string gameId)
    {
        string json = "[]";

        if (lobbies.ContainsKey(gameId))
        {
            Dictionary<int, Player> lobby = lobbies[gameId].players;
            json = JsonSerializer.Serialize(lobby.Values);
        }

        await Clients.Groups(gameId).SendAsync("SyncPlayers", json);
    }

    public async Task JoinLobby(string gameId, string name, string mode, int count)
    {
        Player currentPlayer = new Player(name);

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, new Lobby(mode, count));
            currentPlayer.isHost = true;
        }

        Dictionary<int, Player> lobby = lobbies[gameId].players;
        GameMode gameMode = lobbies[gameId].gameMode;

        currentPlayer.id = lobby.Count + 1;

        while (lobby.ContainsKey(currentPlayer.id))
        {
            currentPlayer.id++;
        }

        lobby.Add(currentPlayer.id, currentPlayer);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEventListener", JsonSerializer.Serialize(currentPlayer));

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("SetGameMode", JsonSerializer.Serialize(gameMode));

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "Join Lobby {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async void RemovePlayer(string gameId, int id)
    {
        if (!lobbies.ContainsKey(gameId))
        {
            System.Console.WriteLine("NO GAME ID FOUND TO RENMOVE");
            return;
        }

        var lobby = lobbies[gameId].players;

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
        }

        else if (p.isHost) {
            Player nextPlayer = lobby.First().Value;
            nextPlayer.isHost = true;
        }

        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "Remove Player {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async Task ClearStats(string gameId)
    {
        System.Console.WriteLine(
            "ClearStats {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
        System.Console.WriteLine("Clearing Stat of gameID: " + gameId);
        if (!lobbies.ContainsKey(gameId))
        {
            return;
        }

        Dictionary<int, Player> players = lobbies[gameId].players;

        foreach (var player in players.Values)
        {
            player.hasComplete = false;
            player.progress = 0;
            player.score = 0;
        }

        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "Cleared Stats {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async Task StartGame(string gameId, string mode)
    {
        System.Console.WriteLine("STARTING GAME RIGHT NOW -- GENERATING EQUATIONS");
        System.Console.WriteLine(
            "Start Game {0}",
            JsonSerializer.Serialize(lobbies[gameId], new JsonSerializerOptions { WriteIndented = true })
        );
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

        // if (selectedMode.type != "time")
        // {
        //     return;
        // }

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
        var lobby = lobbies[gameId].players;
        var player = lobby[playerId];
        player.score = score;

        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "UpdateScore {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async Task UpdatePlayerState(string gameId, int playerId, bool hasComplete)
    {
        var lobby = lobbies[gameId].players;
        var player = lobby[playerId];
        player.hasComplete = hasComplete;

        await SyncPlayers(gameId);

        System.Console.WriteLine(
            "UpdateState {0}",
            JsonSerializer.Serialize(lobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public async Task ChangePublic(string gameId) {
        lobbies[gameId].isPublic = !lobbies[gameId].isPublic;

        await Clients.Groups(gameId).SendAsync("ChangePublic", lobbies[gameId].isPublic);

        if (lobbies[gameId].isPublic) {
            string hostName;
            if (lobbies[gameId].players.First().Value.isHost) {
                hostName = lobbies[gameId].players.First().Value.name;
            }
            else {
                var e = lobbies[gameId].players.GetEnumerator();
                e.MoveNext();
                while (!e.Current.Value.isHost) {
                    e.MoveNext();
                }
                hostName = e.Current.Value.name;
            }
            publicLobbies.Add(gameId, new PublicGame(gameId, hostName, lobbies[gameId].players.Count, lobbies[gameId].gameMode));
        }
        else {
            publicLobbies.Remove(gameId);
        }

        System.Console.WriteLine(
            "ChangePublic {0}",
            JsonSerializer.Serialize(publicLobbies, new JsonSerializerOptions { WriteIndented = true })
        );
    }
    public async Task SyncPublicLobbies() {
        string json = JsonSerializer.Serialize(publicLobbies.Values);

        await Clients.Client(Context.ConnectionId).SendAsync("SyncPublicLobbies", json);
    }
}
