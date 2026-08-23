<!DOCTYPE html>
<html lang="id" class="h-full scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Lapangin — Operating System Lapangan Olahraga' }}</title>
    <meta name="description" content="{{ $description ?? 'Platform manajemen jadwal, reservasi mandiri pelanggan, dan rekapitulasi omzet untuk pemilik arena futsal, badminton, dan mini soccer.' }}">

    <!-- Google Font: Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

    <!-- Vite Assets (Tailwind v4 & JS) -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-full bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col justify-between antialiased">
    
    {{ $slot }}

</body>
</html>
