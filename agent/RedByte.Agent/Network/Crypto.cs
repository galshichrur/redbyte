using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using NSec.Cryptography;

namespace RedByte.Agent.Network;

public sealed class CryptoSession
{
    public const int PublicKeySize = 32;
    public const int NonceSize = 12;
    public const int TagSize = 16;
    public const int MinEncryptedBodySize = NonceSize + TagSize;

    private byte[]? _sharedKey;

    public byte[] CreatePublicKey(out Key privateKey)
    {
        privateKey = Key.Create(KeyAgreementAlgorithm.X25519, new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport
        });

        return privateKey.PublicKey.Export(KeyBlobFormat.RawPublicKey);
    }

    public void SetSharedKey(Key privateKey, byte[] serverPublicKey)
    {
        if (serverPublicKey.Length != PublicKeySize)
            throw new Exception("Invalid server public key length.");

        PublicKey serverKey = PublicKey.Import(
            KeyAgreementAlgorithm.X25519,
            serverPublicKey,
            KeyBlobFormat.RawPublicKey
        );

        SharedSecret? sharedSecret = KeyAgreementAlgorithm.X25519.Agree(privateKey, serverKey);
        if (sharedSecret is null)
            throw new CryptographicException("Could not create shared secret.");

        HkdfSha256 hkdf = new HkdfSha256();
        _sharedKey = hkdf.DeriveBytes(sharedSecret, salt: null, info: null, count: 32);
    }

    public byte[] Encrypt(object payload)
    {
        byte[] key = GetSharedKey();
        byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
        byte[] plaintext = JsonSerializer.SerializeToUtf8Bytes(payload);
        byte[] ciphertext = new byte[plaintext.Length];
        byte[] tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);
        
        // nonce(12) | ciphertext | tag(16)
        byte[] body = new byte[NonceSize + ciphertext.Length + TagSize];
        Buffer.BlockCopy(nonce, 0, body, 0, NonceSize);
        Buffer.BlockCopy(ciphertext, 0, body, NonceSize, ciphertext.Length);
        Buffer.BlockCopy(tag, 0, body, NonceSize + ciphertext.Length, TagSize);

        return body;
    }

    public T? Decrypt<T>(byte[] body)
    {
        if (body.Length < MinEncryptedBodySize)
            throw new Exception("Invalid encrypted frame body length.");

        byte[] key = GetSharedKey();
        byte[] nonce = body[..NonceSize];
        byte[] ciphertext = body[NonceSize..^TagSize];
        byte[] tag = body[^TagSize..];
        byte[] plaintext = new byte[ciphertext.Length];

        using var aes = new AesGcm(key, TagSize);
        aes.Decrypt(nonce, ciphertext, tag, plaintext);

        return JsonSerializer.Deserialize<T>(Encoding.UTF8.GetString(plaintext));
    }

    public void Clear()
    {
        if (_sharedKey is not null)
        {
            CryptographicOperations.ZeroMemory(_sharedKey);
            _sharedKey = null;
        }
    }

    private byte[] GetSharedKey()
    {
        return _sharedKey ?? throw new Exception("Secure session was not started.");
    }
}
