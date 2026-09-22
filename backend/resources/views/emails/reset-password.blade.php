<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Kata Sandi - Lapangin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            color: #1e293b;
            margin: 0;
            padding: 24px 12px;
            line-height: 1.6;
        }
        .container {
            max-width: 540px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0b1c30;
            padding: 28px 32px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 32px 32px 28px 32px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .text {
            font-size: 14px;
            color: #475569;
            margin-bottom: 24px;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            display: inline-block;
            background-color: #006e2f;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            padding: 13px 32px;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 110, 47, 0.25);
        }
        .notice-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #166534;
        }
        .fallback-text {
            font-size: 12px;
            color: #64748b;
            word-break: break-all;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 32px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Lapangin</h1>
        </div>
        <div class="content">
            <div class="greeting">Halo, {{ $user->name }}</div>
            <p class="text">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun Lapangin Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:
            </p>
            
            <div class="btn-container">
                <a href="{{ $resetUrl }}" target="_blank" class="btn">Reset Password Anda</a>
            </div>

            <div class="notice-box">
                ⏱️ <strong>Penting:</strong> Tautan ini hanya berlaku selama <strong>{{ $expiresInMinutes }} menit</strong> dan hanya dapat digunakan satu kali demi keamanan akun Anda.
            </div>

            <p class="text" style="margin-bottom: 0; font-size: 13px; color: #64748b;">
                Jika Anda tidak meminta pengaturan ulang kata sandi ini, silakan abaikan email ini. Akun Anda tetap aman dan tidak ada perubahan yang dibuat.
            </p>

            <div class="fallback-text">
                Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
                <a href="{{ $resetUrl }}" style="color: #006e2f;">{{ $resetUrl }}</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Lapangin. Platform Reservasi &amp; Manajemen Lapangan Olahraga.
        </div>
    </div>
</body>
</html>
