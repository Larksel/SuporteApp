FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SuporteApp.WebAPI.csproj", "./"]
RUN dotnet restore "SuporteApp.WebAPI.csproj"
COPY . .
RUN dotnet publish "SuporteApp.WebAPI.csproj" -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SuporteApp.WebAPI.dll"]