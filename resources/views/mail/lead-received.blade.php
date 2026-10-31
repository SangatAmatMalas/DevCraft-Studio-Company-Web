<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Brief Anda sudah kami terima</title>
</head>
<body style="font-family: Arial, sans-serif; color: #172033; line-height: 1.6;">
    <h1 style="font-size: 18px;">Terima kasih, {{ $lead->name }}.</h1>
    <p>Brief Anda sudah masuk ke {{ $brand }}. Tim akan meninjaunya dan membalas melalui kanal yang Anda pilih.</p>

    <h2 style="font-size: 16px; margin-top: 24px;">Ringkasan brief</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        @if ($lead->organization)
            <tr><td><strong>Organisasi</strong></td><td>{{ $lead->organization }}</td></tr>
        @endif
        @if ($lead->service_type)
            <tr><td><strong>Jenis kebutuhan</strong></td><td>{{ $lead->service_type }}</td></tr>
        @endif
        @if ($lead->package)
            <tr><td><strong>Paket</strong></td><td>{{ $lead->package->name }}</td></tr>
        @endif
        @if ($lead->portfolioProject)
            <tr><td><strong>Referensi proyek</strong></td><td>{{ $lead->portfolioProject->title }}</td></tr>
        @endif
        @if ($lead->budget_range)
            <tr><td><strong>Estimasi budget</strong></td><td>{{ $lead->budget_range }}</td></tr>
        @endif
        @if ($lead->target_timeline)
            <tr><td><strong>Target waktu</strong></td><td>{{ $lead->target_timeline }}</td></tr>
        @endif
        @if ($lead->reference_url)
            <tr><td><strong>Tautan referensi</strong></td><td>{{ $lead->reference_url }}</td></tr>
        @endif
        @if ($attachmentCount > 0)
            <tr><td><strong>Lampiran</strong></td><td>{{ $attachmentCount }} file diterima</td></tr>
        @endif
    </table>

    <h2 style="font-size: 16px; margin-top: 24px;">Kebutuhan Anda</h2>
    <p style="white-space: pre-line;">{{ $lead->message }}</p>

    <p style="margin-top: 24px;">Jika ada informasi tambahan, balas email ini atau hubungi kami melalui halaman kontak.</p>

    <p style="margin-top: 24px; color: #64748B; font-size: 12px;">
        Data yang Anda kirim hanya digunakan untuk menindaklanjuti permintaan ini. Kami tidak menjual atau memakainya untuk promosi.
    </p>

    @if ($contactEmail)
        <p style="margin-top: 12px; color: #64748B; font-size: 12px;">Kontak: {{ $contactEmail }}</p>
    @endif
</body>
</html>
