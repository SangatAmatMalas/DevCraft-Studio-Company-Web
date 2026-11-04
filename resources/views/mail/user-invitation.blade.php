<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Undangan akses admin</title>
</head>
<body style="font-family: Arial, sans-serif; color: #172033; line-height: 1.6;">
    <h1 style="font-size: 18px;">Anda diundang mengelola {{ $brand }}</h1>
    <p>Halo {{ $invitation->name }},</p>
    <p>
        Super Admin {{ $brand }} mengundang Anda untuk masuk ke area admin dengan peran
        <strong>{{ $invitation->role->label() }}</strong>.
    </p>
    <p>
        Buat kata sandi Anda sendiri melalui tautan berikut. Tautan hanya berlaku sekali dan kedaluwarsa pada
        <strong>{{ $invitation->expires_at->translatedFormat('d F Y H:i') }}</strong>.
    </p>
    <p style="margin: 24px 0;">
        <a href="{{ $acceptUrl }}" style="background: #1d4ed8; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Buat kata sandi
        </a>
    </p>
    <p style="font-size: 13px; color: #5a6474;">
        Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:<br>
        <span style="word-break: break-all;">{{ $acceptUrl }}</span>
    </p>
    <p style="font-size: 13px; color: #5a6474;">
        Abaikan email ini jika Anda tidak mengenal pengirimnya. Tidak ada kata sandi yang dikirim melalui email;
        kata sandi hanya dibuat oleh Anda sendiri melalui tautan di atas.
    </p>
    @if ($contactEmail)
        <p style="font-size: 13px; color: #5a6474;">
            Butuh bantuan? Hubungi <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.
        </p>
    @endif
</body>
</html>
