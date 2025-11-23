<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class SaveAdminRequest
 *
 * @property \App\Models\User|null $admin
 * @method string input()
 */
class SaveAdminRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $this->admin?->id,
            'password' => ['nullable','string','min:8','confirmed', Rule::requiredIf(!$this->admin?->id)],
            'role' => 'required|in:' . implode(',', [
                RoleEnum::SuperAdmin->value,
                RoleEnum::Admin->value,
            ]),
        ];
    }
}
