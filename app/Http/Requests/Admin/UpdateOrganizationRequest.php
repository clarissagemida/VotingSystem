<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized
     * to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                Rule::in([
                    'SSG',
                    'FLP',
                    'OTHER',
                ]),
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The organization name is required.',

            'name.string' => 'The organization name must be valid text.',

            'name.max' => 'The organization name must not exceed 255 characters.',

            'type.required' => 'Please select an organization type.',

            'type.in' => 'The selected organization type is invalid.',
        ];
    }
}
