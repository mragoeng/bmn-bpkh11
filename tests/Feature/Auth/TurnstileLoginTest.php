<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TurnstileLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_exposes_turnstile_configuration_when_enabled(): void
    {
        config()->set('services.turnstile.enabled', true);
        config()->set('services.turnstile.site_key', 'site-key-demo');
        config()->set('services.turnstile.secret_key', 'secret-key-demo');

        $response = $this->get('/login');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Auth/Login')
            ->where('turnstile.enabled', true)
            ->where('turnstile.siteKey', 'site-key-demo')
        );
    }

    public function test_users_can_authenticate_when_turnstile_verification_passes(): void
    {
        config()->set('services.turnstile.enabled', true);
        config()->set('services.turnstile.site_key', 'site-key-demo');
        config()->set('services.turnstile.secret_key', 'secret-key-demo');

        Http::fake([
            'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'action' => 'login',
                'hostname' => '127.0.0.1',
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->post('/login', [
            'username' => $user->username,
            'password' => 'password',
            'cf_turnstile_response' => 'token-demo',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_when_turnstile_verification_fails(): void
    {
        config()->set('services.turnstile.enabled', true);
        config()->set('services.turnstile.site_key', 'site-key-demo');
        config()->set('services.turnstile.secret_key', 'secret-key-demo');

        Http::fake([
            'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => false,
                'error-codes' => ['timeout-or-duplicate'],
            ], 200),
        ]);

        $user = User::factory()->create();

        $response = $this->from('/login')->post('/login', [
            'username' => $user->username,
            'password' => 'password',
            'cf_turnstile_response' => 'expired-token',
        ]);

        $this->assertGuest();
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors([
            'cf_turnstile_response' => 'Captcha sudah kedaluwarsa atau sudah dipakai. Silakan verifikasi ulang.',
        ]);
    }
}
