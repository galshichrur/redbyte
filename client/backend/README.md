## Compile backend agent (using MSVC)
```bash
cd ./client/backend
cmake -S . -B build -G "Visual Studio 18 2026"
cmake --build build --config Release
```
### Build RedByte installer (Electron.js)
```bash
cd ../frontend
move .env.example .env
npm run build
```
Installer compiled at client/frontend/dist/redbyte-installer.exe
