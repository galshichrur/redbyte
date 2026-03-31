using System.Security.Cryptography;
using NSec.Cryptography;

namespace RedByte.Agent.Network;

public class CryptoManager
{
    private byte[] _sharedKey;

    public byte[] GetPublicKey(out Key privateKey)
    {
        privateKey = Key.Create(KeyAgreementAlgorithm.X25519, new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport
        });

        return privateKey.PublicKey.Export(KeyBlobFormat.RawPublicKey);
    }

    public void SetSharedKey(Key myPrivateKey, byte[] serverPublicKey)
    {
        PublicKey serverKey = PublicKey.Import(KeyAgreementAlgorithm.X25519, serverPublicKey, KeyBlobFormat.RawPublicKey);
        SharedSecret sharedSecret = KeyAgreementAlgorithm.X25519.Agree(myPrivateKey, serverKey);

        HkdfSha256 hkdf = new HkdfSha256();
        _sharedKey = hkdf.DeriveBytes(sharedSecret, null, null, 32);
    }
    public byte[] Encrypt(string plaintext)
    {
        byte[] nonce = RandomNumberGenerator.GetBytes(12);
        byte[] plainBytes = System.Text.Encoding.UTF8.GetBytes(plaintext);
        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[16];

        using var aes = new AesGcm(_sharedKey, 16);
        aes.Encrypt(nonce, plainBytes, cipherBytes, tag);

        byte[] result = new byte[nonce.Length + tag.Length + cipherBytes.Length];
        nonce.CopyTo(result, 0);
        tag.CopyTo(result, nonce.Length);
        cipherBytes.CopyTo(result, nonce.Length + tag.Length);

        return result;
    }
}