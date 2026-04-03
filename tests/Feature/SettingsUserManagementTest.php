<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_user_page_can_be_rendered(): void
    {
        $response = $this
            ->actingAs(User::factory()->create())
            ->get(route('settings.pengaturan-user'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Settings/PengaturanUser'));
    }

    public function test_user_can_be_created_from_settings(): void
    {
        $response = $this
            ->actingAs(User::factory()->create())
            ->post(route('settings.pengaturan-user.store'), [
                'name' => 'Operator Baru',
                'username' => 'operator_baru',
                'email' => 'operator@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

        $response->assertRedirect(route('settings.pengaturan-user'));

        $this->assertDatabaseHas('users', [
            'username' => 'operator_baru',
            'email' => 'operator@example.com',
        ]);
    }

    public function test_user_can_be_updated_from_settings(): void
    {
        $admin = User::factory()->create();
        $user = User::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->put(route('settings.pengaturan-user.update', $user), [
                'name' => 'Nama Diperbarui',
                'username' => 'username_baru',
                'email' => 'baru@example.com',
                'password' => '',
                'password_confirmation' => '',
            ]);

        $response->assertRedirect(route('settings.pengaturan-user'));

        $user->refresh();

        $this->assertSame('Nama Diperbarui', $user->name);
        $this->assertSame('username_baru', $user->username);
        $this->assertSame('baru@example.com', $user->email);
    }

    public function test_current_logged_in_user_can_not_be_deleted_from_settings(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('settings.pengaturan-user.destroy', $user));

        $response->assertRedirect(route('settings.pengaturan-user'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
        ]);
    }
}
