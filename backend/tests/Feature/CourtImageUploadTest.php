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

class CourtImageUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Create Free Plan
        $freePlan = Plan::create([
            'name'                   => 'FREE',
            'description'            => 'Paket Percobaan',
            'price'                  => 0,
            'max_courts'             => 1,
            'max_bookings_per_month' => 30,
            'is_active'              => true,
        ]);

        $this->owner = User::create([
            'name'          => 'Owner Upload Test',
            'email'         => 'owner_upload@lapangin.id',
            'password_hash' => Hash::make('password123'),
            'phone'         => '081234567899',
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
        $file = UploadedFile::fake()->image('court_photo.jpg', 600, 400)->size(1500); // 1.5MB

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $path = $response->json('path');
        $this->assertNotEmpty($path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_rejects_non_image_or_script_files(): void
    {
        $maliciousFile = UploadedFile::fake()->create('malicious.php', 10, 'text/x-php');

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $maliciousFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_rejects_oversized_images(): void
    {
        $largeFile = UploadedFile::fake()->image('huge.png')->size(2500); // 2.5MB > 2MB limit

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $largeFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_can_create_court_with_multipart_image(): void
    {
        $file = UploadedFile::fake()->image('my_court.png', 800, 600)->size(1000);

        $response = $this->postJson('/api/courts', [
            'name'           => 'Lapangan Tenis Pro',
            'sport_type'     => 'Tenis',
            'price_per_hour' => 120000,
            'address'        => 'Jl. Sukajadi No. 45',
            'city'           => 'Bandung',
            'image'          => $file,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data'    => [
                    'name' => 'Lapangan Tenis Pro',
                ],
            ]);

        $imageUrl = $response->json('data.image_url');
        $this->assertStringContainsString('/storage/courts/', $imageUrl);
    }

    public function test_rejects_renamed_non_image_file_disguised_as_jpg(): void
    {
        // Renamed text/script file with .jpg extension (MIME spoofing attack)
        $fakeJpg = UploadedFile::fake()->createWithContent(
            'script_disguised.jpg',
            "<?php phpinfo(); ?> This is plain PHP code disguised as a photo."
        );

        $response = $this->postJson('/api/courts/upload-image', [
            'image' => $fakeJpg,
        ]);

        $response->assertStatus(422);
    }
}
