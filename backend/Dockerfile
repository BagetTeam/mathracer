FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# Copy everything and restore
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Use the ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Set environment variable for Render's dynamic port
ENV ASPNETCORE_URLS=http://+:10000

# Expose the port
EXPOSE 10000

# Run the app
ENTRYPOINT ["dotnet", "typeracer.csproj"]