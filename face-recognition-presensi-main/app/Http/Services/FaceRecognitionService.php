<?php

namespace App\Http\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class FaceRecognitionService
{
    public static function recognizeAll(Media $photo, MediaCollection $references)
    {
        $multipart = [];

        $multipart[] = [
            'name'     => 'photo',
            'contents' => fopen($photo->getPath(), 'r'),
            'filename' => $photo->file_name,
        ];

        foreach ($references as $reference) {
            $multipart[] = [
                'name'     => 'references',
                'contents' => fopen($reference->getPath(), 'r'),
                'filename' => $reference->file_name,
            ];
        }

        return Http::attach($multipart)
            ->post(config('services.face_recognition.base_url') . '/verify-face');
    }

    public static function recognize(UploadedFile $photo, Media $reference)
    {
        return Http::asMultipart()
            ->attach('photo', fopen($photo->getRealPath(), 'r'), $photo->getClientOriginalName())
            ->attach('references', fopen($reference->getPath(), 'r'))
            ->post(config('services.face_recognition.base_url') . '/verify-face');
    }

    public static function checkFacePresence(UploadedFile $photo)
    {
        return Http::asMultipart()
            ->attach('image', fopen($photo->getRealPath(), 'r'), $photo->getClientOriginalName())
            ->post(config('services.face_recognition.base_url') . '/check-face-presence');
    }
}
