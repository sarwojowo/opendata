<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class PhotoUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'max:3', 'min:1'],
            'photos.*' => ['required', 'image', 'extensions:jpeg,png,jpg,webp', 'mimes:jpeg,png,jpg,webp', 'max:5120']
        ];
    }
}
