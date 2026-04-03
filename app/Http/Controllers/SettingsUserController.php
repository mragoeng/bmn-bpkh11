<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserManagementRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsUserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/PengaturanUser', [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'username', 'email', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'created_at' => optional($user->created_at)?->format('Y-m-d H:i'),
                    'is_current_user' => auth()->id() === $user->id,
                ]),
        ]);
    }

    public function store(UserManagementRequest $request)
    {
        $validated = $request->validated();

        User::query()->create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?: null,
            'password' => Hash::make($validated['password']),
        ]);

        return to_route('settings.pengaturan-user')->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UserManagementRequest $request, User $user)
    {
        $validated = $request->validated();

        $payload = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?: null,
        ];

        if (filled($validated['password'] ?? null)) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        return to_route('settings.pengaturan-user')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return to_route('settings.pengaturan-user')->with('error', 'User yang sedang dipakai login tidak bisa dihapus.');
        }

        $user->delete();

        return to_route('settings.pengaturan-user')->with('success', 'User berhasil dihapus.');
    }
}
