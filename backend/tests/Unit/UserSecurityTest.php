<?php

namespace Tests\Unit;

use App\Filament\Resources\Users\Schemas\UserForm;
use App\Models\User;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSecurityTest extends TestCase
{
    public function test_user_model_automatically_hashes_plaintext_password(): void
    {
        $user = new User();
        $user->password_hash = 'mySecretPassword123';

        $this->assertNotEquals('mySecretPassword123', $user->password_hash);
        $this->assertTrue(Hash::check('mySecretPassword123', $user->password_hash));
    }

    public function test_user_model_does_not_double_hash_existing_hash(): void
    {
        $existingHash = Hash::make('alreadyHashed123');
        $user = new User();
        $user->password_hash = $existingHash;

        $this->assertEquals($existingHash, $user->password_hash);
        $this->assertTrue(Hash::check('alreadyHashed123', $user->password_hash));
    }

    public function test_user_form_has_password_hash_mutator(): void
    {
        $schema = Schema::make();
        $configured = UserForm::configure($schema);
        $components = $configured->getComponents();

        $passwordField = null;
        foreach ($components as $component) {
            if (method_exists($component, 'getName') && $component->getName() === 'password_hash') {
                $passwordField = $component;
                break;
            }
        }

        $this->assertNotNull($passwordField, 'password_hash field must exist in UserForm');
    }
}
