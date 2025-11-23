<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Concerns\InteractsWithInput;

/**
 * @method string input(string $key, mixed $default = null)
 * @method bool filled(string $key)
 */
class StoreUserAttendanceRequest extends FormRequest
{
    use InteractsWithInput;
    
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'check_in_photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'check_out_photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }
}
