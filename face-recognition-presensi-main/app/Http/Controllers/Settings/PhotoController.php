<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PhotoUpdateRequest;
use App\Http\Services\FaceRecognitionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PhotoController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        /** @disregard P1013 */
        /** @var \App\Models\User $user */
        $user = $request->user();
        $media = $user->getMedia('face-reference');

        return Inertia::render('settings/Photos', [
            'photo_urls' => $media->map(fn (Media $media) => $media->getFullUrl()),
            'media' => $media
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(PhotoUpdateRequest $request): RedirectResponse
    {
        /** @disregard P1013 */
        /** @var \App\Models\User $user */
        $user = $request->user();

        $existingMedia = $user->getMedia('face-reference');

        /** @disregard P1013 */
        $photos = collect($request->file('photos'));

        try {
            $photos->each(function (UploadedFile $photo, $index) {
                /** @disregard */
                $response = FaceRecognitionService::checkFacePresence($photo);
                $body = $response->json();
    
                if (!$response->successful()) {
                    $message = isset($body['detail']) ? $body['detail'] : 'Failed to detect face.';
    
                    throw new \LogicException('Gambar ' . ($index + 1) . ': ' . $message);
                }
            });
    
            DB::transaction(function () use ($photos, $user, $existingMedia) {
                $photos->each(fn (UploadedFile $photo) => $user->addMedia($photo)->toMediaCollection('face-reference', 'public'));
                
                if ($existingMedia->isNotEmpty()) {
                    $existingMedia->each(fn (Media $media) => $media->forceDelete());
                }
            });
    
            return back();
        } catch (\Throwable $th) {
            return back()
                ->withErrors([
                    'photos' => $th->getMessage() . ' Silahkan masukkan ulang.'
                ]);
        }
    }
}
