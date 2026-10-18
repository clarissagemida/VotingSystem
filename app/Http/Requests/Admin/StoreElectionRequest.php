<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreElectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized.
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
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'start_at' => [
                'required',
                'date',
            ],

            'end_at' => [
                'required',
                'date',
                'after:start_at',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Election title is required.',

            'title.max' => 'Election title must not exceed 255 characters.',

            'start_at.required' => 'Start date and time is required.',

            'start_at.date' => 'Please enter a valid start date and time.',

            'end_at.required' => 'End date and time is required.',

            'end_at.date' => 'Please enter a valid end date and time.',

            'end_at.after' => 'End date and time must be after the start date and time.',
        ];
    }
}
