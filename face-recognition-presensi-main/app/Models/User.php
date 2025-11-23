<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, InteractsWithMedia, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('face-reference');
    }

    public function userPermissions(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getAllPermissions()
                ->pluck('name')
                ->toArray(),
        );
    }

    public function role(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->roles->first()?->name,
        );
    }

    public function roleTranslated(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->role ? RoleEnum::fromValue($this->role)->translated() : null,
        );
    }

    public function photoUrls(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getMedia('face-reference')->map(fn (Media $media) => $media->getFullUrl()),
        );
    }

    #[Scope]
    protected function search(Builder $query, ?string $keyword): void
    {
        if (empty($keyword)) {
            return;
        }
        
        $keyword = trim($keyword);
        $query->where('name', 'like', sprintf('%%%s%%', $keyword))
            ->orWhere('email', 'like', sprintf('%%%s%%', $keyword));
    }
}
