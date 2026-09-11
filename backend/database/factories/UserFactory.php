<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The default hashed password (reused for performance).
     */
    protected static ?string $passwordHash = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = fake()->dateTimeBetween('-6 months', '-1 days');

        return [
            'name' => fake('id_ID')->name(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => static::$passwordHash ??= Hash::make('password123'),
            'phone' => '08' . fake()->numerify('##########'),
            'role' => 'OWNER',
            'status' => 'ACTIVE',
            'remember_token' => Str::random(10),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    /**
     * State for Court Owner user.
     */
    public function owner(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'OWNER',
        ]);
    }

    /**
     * State for Customer / Renter user.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'CUSTOMER',
        ]);
    }

    /**
     * State for Inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INACTIVE',
        ]);
    }
}
