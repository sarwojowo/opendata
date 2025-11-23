<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UserAttendanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__ . '/settings.php'; // NOSONAR
require __DIR__ . '/auth.php'; // NOSONAR

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('attendances', AttendanceController::class)
            ->only(['index', 'create', 'store']);

        Route::resource('users', UserController::class);
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->name('users.reset-password');
        Route::post('users/{user}/update-photos', [UserController::class, 'updatePhotos'])
            ->name('users.update-photos');

        Route::resource('admins', AdminController::class);
        Route::post('admins/{admin}/reset-password', [AdminController::class, 'resetPassword'])
            ->name('admins.reset-password');

        Route::resource('user-attendances', UserAttendanceController::class)->only(['index', 'create', 'store', 'show']);
        Route::post('user-attendances/{user_attendance}/validate', [UserAttendanceController::class, 'validate'])->name('user-attendances.validate');
    });
