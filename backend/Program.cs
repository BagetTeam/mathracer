using hub;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// for the thing trust
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("https://mathracer-phi.vercel.app");
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
            policy.AllowCredentials();
        }
    );
});

builder.Services.AddSignalR();

var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins);

app.MapHub<RacerHub>("/hub");

app.Run();

