<?php

use App\Http\Controllers\LogoSettingController;
use Illuminate\Support\Facades\Route;

Route::get('/logo', [LogoSettingController::class, 'getLogo']);
