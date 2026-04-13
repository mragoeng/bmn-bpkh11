<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LogoSettingController extends Controller
{
    public function edit(): \Inertia\Response
    {
        $logoPath = AppSetting::get('app_logo');
        $appName = AppSetting::get('app_name', 'BMN-BPKH11');

        return Inertia::render('Settings/PengaturanLogo', [
            'logo' => $logoPath ? Storage::url($logoPath) : null,
            'appName' => $appName,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'logo' => ['nullable', 'image', 'max:2048', 'dimensions:max_width=500,max_height=500'],
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            $oldLogo = AppSetting::get('app_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }

            // Store new logo
            $path = $request->file('logo')->store('logos', 'public');
            AppSetting::set('app_logo', $path);
        } elseif ($request->input('remove_logo')) {
            // Remove logo
            $oldLogo = AppSetting::get('app_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }
            AppSetting::set('app_logo', null);
        }

        return to_route('settings.pengaturan-logo')->with('success', 'Logo berhasil diperbarui.');
    }

    public function getLogo(): \Illuminate\Http\JsonResponse
    {
        $logoPath = AppSetting::get('app_logo');
        
        return response()->json([
            'logo' => $logoPath ? Storage::url($logoPath) : null,
        ]);
    }
}
