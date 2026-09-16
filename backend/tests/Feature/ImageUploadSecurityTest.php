<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImageUploadSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $freePlan = Plan::create([
            'name'                   => 'FREE',
            'description'            => 'Paket Percobaan',
            'price'                  => 0,
            'max_courts'             => 1,
            'max_bookings_per_month' => 30,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Secure Upload',
            'email'         => 'owner_sec@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567800',
            'role'          => 'OWNER',
            'status'        => 'ACTIVE',
        ]);

        Subscription::create([
            'user_id'    => $this->owner->user_id,
            'plan_id'    => $freePlan->plan_id,
            'start_date' => now(),
            'end_date'   => now()->addYear(),
            'status'     => 'ACTIVE',
        ]);

        Sanctum::actingAs($this->owner);
    }

    public function test_can_upload_valid_image(): void
    {
        $file = UploadedFile::fake()->image('court_photo.jpg', 600, 400)->size(1200);

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Foto lapangan berhasil diunggah.',
            ]);

        $path = $response->json('path');
        $this->assertNotEmpty($path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_rejects_renamed_php_file_disguised_as_jpg(): void
    {
        // Renamed script file disguised as JPG with fake extension
        $fakeJpg = UploadedFile::fake()->createWithContent(
            'avatar_shell.jpg',
            "<?php phpinfo(); system('id'); ?>"
        );

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $fakeJpg,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_rejects_renamed_exe_disguised_as_png(): void
    {
        // Windows executable binary header (MZ) disguised as PNG
        $fakePng = UploadedFile::fake()->createWithContent(
            'malware.png',
            "MZ\x90\x00\x03\x00\x00\x00This is a binary executable."
        );

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $fakePng,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_rejects_oversized_image_with_clear_error_message(): void
    {
        // Default max is 2048 KB (2MB). 2500 KB should be rejected.
        $largeFile = UploadedFile::fake()->image('huge_photo.jpg', 1200, 800)->size(2500);

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $largeFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);

        $errorMessage = $response->json('errors.image.0');
        $this->assertStringContainsString('Ukuran gambar maksimal', $errorMessage);
    }

    public function test_store_court_endpoint_rejects_disguised_script_file(): void
    {
        $fakeFile = UploadedFile::fake()->createWithContent(
            'trojan.jpg',
            "#!/bin/bash\nrm -rf /"
        );

        $response = $this->postJson('/api/courts', [
            'name'           => 'Lapangan Bad File',
            'sport_type'     => 'Futsal',
            'price_per_hour' => 100000,
            'address'        => 'Jl. Testing No. 1',
            'city'           => 'Jakarta Selatan',
            'image'          => $fakeFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }
}
