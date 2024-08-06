# Offical build image

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env

WORKDIR /app
 
# copy .csproj and restore dependencies

COPY *.csproj ./

RUN dotnet restore
 
# copy further app files

COPY . ./

RUN dotnet publish -c Release -o out
 
# Official runtime image

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build-env /app/out .
 
# Setze die Startbefehlszeile für die Anwendung

ENTRYPOINT ["dotnet", "PingPong.dll"]
EXPOSE 80
 