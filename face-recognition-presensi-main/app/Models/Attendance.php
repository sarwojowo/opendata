<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Attendance extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'date', 'check_in', 'check_out', 'check_in_photo_distance', 'check_out_photo_distance'];


    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('check-in-photo')
            ->singleFile();

        $this->addMediaCollection('check-out-photo')
            ->singleFile();
    }

    #[Scope]
    protected function userId(Builder $query, ?string $userId): void
    {
        if (empty($userId)) {
            return;
        }
        
        $query->where('user_id', $userId);
    }

    #[Scope]
    protected function since(Builder $query, ?string $since): void
    {
        if (empty($since)) {
            return;
        }
        
        $query->where('check_in', '>=', Carbon::parse($since)->startOfDay());
    }

    #[Scope]
    protected function until(Builder $query, ?string $until): void
    {
        if (empty($until)) {
            return;
        }
        
        $query->where('check_in', '<=', Carbon::parse($until)->endOfDay());
    }

    protected function time(): Attribute
    {
        return Attribute::make(
            fn () => $this->created_at->isoFormat('dddd, DD MMMM YYYY [pukul] HH:mm [WIB]'),
        );
    }

    public function checkInPhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getFirstMedia('check-in-photo')?->getFullUrl() ?? null,
        );
    }

    public function checkOutPhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getFirstMedia('check-out-photo')?->getFullUrl() ?? null,
        );
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
