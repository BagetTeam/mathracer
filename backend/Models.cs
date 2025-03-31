using equation;

namespace models;

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

public class GameMode
{
    public string type { get; set; }
    public int count { get; set; }

    public GameMode()
    {
        this.type = "time";
        this.count = 100;
    }

    public GameMode(string type, int count)
    {
        this.type = type;
        this.count = count;
    }
}

public class Game
{
    public string id { get; set; }
    public GameMode gameMode { get; set; }
    public Equation[] equations { get; set; }

    public Game(string id, Equation[] eq, GameMode gameMode)
    {
        this.id = id;
        this.gameMode = gameMode;
        this.equations = eq;
    }
}
