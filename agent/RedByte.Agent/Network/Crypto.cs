using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using NSec.Cryptography;

namespace RedByte.Agent.Network;

public static class Crypto
{
    public const int PublicKeySize = 32;
    private const int NonceSize = 12;
    private const int TagSize = 16;

    private static byte[]? _sharedKey;

    public static byte[] CreatePublicKey(out Key privateKey)
    {
        privateKey = Key.Create(KeyAgreementAlgorithm.X25519, new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport
        });

        return privateKey.PublicKey.Export(KeyBlobFormat.RawPublicKey);
    }

    public static void SetSharedKey(Key privateKey, byte[] serverPublicKey)
    {
        if (serverPublicKey.Length != PublicKeySize)
            throw new Exception("Invalid server public key.");

        PublicKey serverKey = PublicKey.Import(KeyAgreementAlgorithm.X25519, serverPublicKey, KeyBlobFormat.RawPublicKey);
        SharedSecret? sharedSecret = KeyAgreementAlgorithm.X25519.Agree(privateKey, serverKey);
        if (sharedSecret == null)
            throw new Exception("Could not create shared key.");

        HkdfSha256 hkdf = new HkdfSha256();
        _sharedKey = hkdf.DeriveBytes(sharedSecret, null, null, 32);
    }

    public static byte[] Encrypt(object data)
    {
        byte[] key = GetSharedKey();
        byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
        byte[] plainBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data));
        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plainBytes, cipherBytes, tag);

        // Frame body: nonce(12) | ciphertext | tag(16)
        byte[] result = new byte[nonce.Length + cipherBytes.Length + tag.Length];
        nonce.CopyTo(result, 0);
        cipherBytes.CopyTo(result, nonce.Length);
        tag.CopyTo(result, nonce.Length + cipherBytes.Length);

        return result;
    }

    public static T? Decrypt<T>(byte[] frame)
    {
        if (frame.Length < NonceSize + TagSize)
            throw new Exception("Invalid encrypted frame.");

        byte[] key = GetSharedKey();
        byte[] nonce = frame[..NonceSize];
        byte[] cipherBytes = frame[NonceSize..^TagSize];
        byte[] tag = frame[^TagSize..];
        byte[] plainBytes = new byte[cipherBytes.Length];

        using var aes = new AesGcm(key, TagSize);
        aes.Decrypt(nonce, cipherBytes, tag, plainBytes);

        string json = Encoding.UTF8.GetString(plainBytes);
        return JsonSerializer.Deserialize<T>(json);
    }

    public static void Clear()
    {
        _sharedKey = null;
    }

    private static byte[] GetSharedKey()
    {
        if (_sharedKey == null)
            throw new Exception("Secure session was not started.");

        return _sharedKey;
    }
}
