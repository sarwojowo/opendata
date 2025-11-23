<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @method string input(string $key, mixed $default = null)
 * @method bool filled(string $key)
 */
class StoreAttendanceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'attendance_id' => 'nullable|integer|exists:attendances,id',
        ];
    }
}
