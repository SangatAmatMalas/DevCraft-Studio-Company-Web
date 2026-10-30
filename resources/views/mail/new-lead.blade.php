<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Lead baru</title>
</head>
<body style="font-family: Arial, sans-serif; color: #172033; line-height: 1.6;">
    <h1 style="font-size: 18px;">Lead baru dari website</h1>
    <p>Sebuah project brief baru masuk. Berikut ringkasannya:</p>

    <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr><td><strong>Nama</strong></td><td>{{ $lead->name }}</td></tr>
        <tr><td><strong>Email</strong></td><td>{{ $lead->email }}</td></tr>
        <tr><td><strong>WhatsApp</strong></td><td>{{ $lead->phone ?: '-' }}</td></tr>
        <tr><td><strong>Organisasi</strong></td><td>{{ $lead->organization ?: '-' }}</td></tr>
        <tr><td><strong>Jenis kebutuhan</strong></td><td>{{ $lead->service_type ?: '-' }}</td></tr>
        <tr><td><strong>Paket</strong></td><td>{{ $lead->package?->name ?: '-' }}</td></tr>
        <tr><td><strong>Portfolio terkait</strong></td><td>{{ $lead->portfolioProject?->title ?: '-' }}</td></tr>
        <tr><td><strong>Budget</strong></td><td>{{ $lead->budget_range ?: '-' }}</td></tr>
        <tr><td><strong>Target waktu</strong></td><td>{{ $lead->target_timeline ?: '-' }}</td></tr>
        <tr><td><strong>Cara dihubungi</strong></td><td>{{ $lead->preferred_contact ?: '-' }}</td></tr>
        <tr><td><strong>Halaman asal</strong></td><td>{{ $lead->source_url ?: '-' }}</td></tr>
    </table>

    <h2 style="font-size: 16px; margin-top: 24px;">Kebutuhan</h2>
    <p style="white-space: pre-line;">{{ $lead->message }}</p>

    <p style="margin-top: 24px;">
        <a href="{{ url('/admin/leads/'.$lead->id) }}" style="background: #2563EB; color: #ffffff; padding: 10px 16px; border-radius: 8px; text-decoration: none;">
            Buka detail lead
        </a>
    </p>
</body>
</html>
