<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PhotoController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::inertia('settings/appearance', 'settings/Appearance')->name('appearance');

    Route::get('settings/photos', [PhotoController::class, 'edit'])->name('photos.edit');
    Route::post('settings/photos', [PhotoController::class, 'update'])->name('photos.update');
});
