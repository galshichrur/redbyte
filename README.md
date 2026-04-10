# RedByte

**This project is under development.**

Manage, monitor, and protect computer networks using a client server architecture.
It allows users to secure their network through a web interface, view the status of connected computers, receive real-time alerts about network attacks and block them.

---

## Structure
- `server/` – backend API and TCP server written in Python
- `agent/` – Windows endpoint software written in C#
- `web/` – frontend website

## Windows Installation
Clone this repository
```
git clone https://github.com/galshichrur/redbyte.git
```
### Web Server
Install Node.js
https://nodejs.org/en/download
```
cd web
move .global.env .env
```
Edit the env file
```
npm install
npm run start
```
The website will be started at port 3000 by default.

### API and TCP Server
Install python https://www.python.org/downloads/
```
cd server
move .global.env .env
```
Edit the env file
```
python main.py
```
The TCP server will start by default on port 9000 and the API on 8000.

### Windows Agent
Install the .NET 10.0 SDK https://dotnet.microsoft.com/download/dotnet/10.0
```
cd agent/RedByte.Agent
dotnet publish -c Release -r win-x64 --self-contained true
```
The compiled executable and all required dependencies will be generated and ready for deployment in the bin/Release/net10.0-windows/publish directory.

To distribute the compiled agent, package the published application files into an executable installer using Inno Setup.
Install Inno Setup: https://jrsoftware.org/isdl.php

Load the setup.iss script located in the root folder and run it.