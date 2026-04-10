# RedByte

**This project is under development.**

Through this platform you can manage, monitor, and protect computer networks using a client-server architecture.
It allows users to secure their network through a web interface, view the status of connected computers, receive real-time alerts about network attacks, and control endpoint computers.

The system is intended for organizations, businesses, and network owners who want centralized control over their network security without requiring deep technical knowledge.

---

## Structure
- `server/` – backend API and TCP server written in Python
- `agent/` – Windows endpoint software written in C#
- `web/` – frontend website

## Windows Installation
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
cd ../server
move .global.env .env
```
Edit the env file
```
python main.py
```
The TCP server will start by default on port 9000 and the API on 8000.
