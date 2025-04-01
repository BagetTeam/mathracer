using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    private static Dictionary<string, Game> games = new Dictionary<string, Game>();

    public async void SyncPlayers(string gameId)
    {
        Dictionary<int, Player> lobby = lobbies[gameId];
        string json = JsonSerializer.Serialize(lobby.Values);
        await Clients.Groups(gameId).SendAsync("SyncPlayers", json);
    }

    public async Task SyncEquations(string gameId) {
        Game game = games[gameId];
        string json = JsonSerializer.Serialize(game.equations);
        await Clients.Groups(gameId).SendAsync("SyncEquations", json);
    }


    public async Task JoinLobby(string gameId, string name, string mode)
    {
        Player currentPlayer = new Player(name);

        GameMode selectedMode = JsonSerializer.Deserialize<GameMode>(mode)!;

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, new Dictionary<int, Player>());
            currentPlayer.isHost = true;
            await GenerateEquations(gameId, selectedMode);
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
        SyncPlayers(gameId);
        await SyncEquations(gameId);
        Console.WriteLine($"Equations for game {gameId}:");
        foreach (Equation eq in games[gameId].equations)
        {
            Console.WriteLine(eq.equation);
        }
    }

    public async void RemovePlayer(string gameId, int id)
    {
        if (!lobbies.ContainsKey(gameId))
        {
            return;
        }

        var lobby = lobbies[gameId];
        Player p = lobby[id];
        lobby.Remove(id);
        if (lobby.Count == 0)
        {
            lobbies.Remove(gameId);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);

        // TODO: change host if host leaves
        // if (p.isHost) {}

        SyncPlayers(gameId);
    }

    private int GetRandomInt(int min, int max) {
        Random random = new Random();
        return random.Next(min, max + 1);
    }

    // private int GenerateId() {
    //     Random rnd = new Random();
    //     return rnd.NextDouble(); //TODO
    // }

    private Equation GenerateAddition(int id) {
        int num1 = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 20);
        return new Equation(id, $"{num1} + {num2} = ?", num1 + num2);
    }

    private Equation GenerateSubtraction(int id) {
        int answer = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer + num2;
        return new Equation(id, $"{num1} - {num2} = ?", answer);
    }

    private Equation GenerateMultiplication(int id) {
        int num1 = GetRandomInt(1, 12);
        int num2 = GetRandomInt(1, 12);
        return new Equation(id, $"{num1} × {num2} = ?", num1 * num2);
    }

    private Equation GenerateDivision(int id) {
        int answer = GetRandomInt(1, 10);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer * num2;
        return new Equation(id, $"{num1} ÷ {num2} = ?", answer);
    }

    private Equation GenerateEquation(int id) {
        int operationType = GetRandomInt(1, 5);
        switch (operationType) {
        case 1:
            return GenerateAddition(id);
        case 2:
            return GenerateSubtraction(id);
        case 3:
            return GenerateMultiplication(id);
        case 4:
            return GenerateDivision(id);
        default:
            return GenerateAddition(id);
        }
    }
    public Equation[] GenerateAllEquations(int count) {
        Equation[] equations = new Equation[count];
        for (int i = 0; i < count; i++) {
            equations[i] = GenerateEquation(i);
        }
        return equations;
    }
    public async Task GenerateEquations(string gameId, GameMode selectedMode) 
    { 
        Equation[] equations = GenerateAllEquations(selectedMode.count);
        Game game = new Game(gameId, new GameMode(selectedMode.type, selectedMode.count), equations);
        Dictionary<int, Player> lobby = lobbies[gameId];
        games.Add(gameId, game);
        
        await SyncEquations(gameId);
    }
}

public class Player
{
    public int id { get; set; }
    public int progress { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }

    public Player(string name)
    {
        id = 0;
        progress = 0;
        score = 0;
        isHost = false;
        this.name = name;
    }
}
public class GameMode {
    public string type {get; set;}
    public int count {get; set;
    }
    public GameMode() {
        this.type = "time";
        this.count = 100;
    }
    public GameMode(string type, int count) {
        this.type = type;
        this.count = count;
    }
}
public class Equation {
    public int id {get; set;}
    public string equation {get; set;}
    public int answer {get; set;}
    public Equation(int id, string equation, int answer) {
        this.id = id;
        this.equation = equation;
        this.answer = answer;
    }
}
public class Game {
    public string id {get; set;}
    public GameMode gameMode {get; set;}
    public Equation[] equations {get; set;}

    public Game(string id, GameMode gameMode, Equation[] equations) {
        this.id = id;
        this.gameMode = gameMode;
        this.equations = equations;
    }
}