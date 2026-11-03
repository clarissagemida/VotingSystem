<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
            ],

            'password' => [
                'required',
                'string',
            ],

            'remember' => [
                'boolean',
            ],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * Admin:
     *      Email + Password
     *
     * Voter:
     *      Username + Password
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = trim($this->input('username'));
        $password = $this->input('password');

        /*
        |--------------------------------------------------------------------------
        | ADMIN LOGIN
        |--------------------------------------------------------------------------
        |
        | If the login value is an email, authenticate using the email column.
        |
        */

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {

            // Email addresses are case-insensitive; PostgreSQL comparisons are not.
            $login = Str::lower($login);

            $credentials = [
                'email' => $login,
                'password' => $password,
            ];

        } else {

            /*
            |--------------------------------------------------------------------------
            | VOTER LOGIN
            |--------------------------------------------------------------------------
            |
            | If the login value is not an email, treat it as a username.
            |
            */

            $credentials = [
                'username' => $login,
                'password' => $password,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATE
        |--------------------------------------------------------------------------
        */

        if (! Auth::attempt(
            $credentials,
            $this->boolean('remember')
        )) {

            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | LOGIN SUCCESSFUL
        |--------------------------------------------------------------------------
        */

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts(
            $this->throttleKey(),
            5
        )) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn(
            $this->throttleKey()
        );

        throw ValidationException::withMessages([
            'username' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('username'))
            .'|'
            .$this->ip()
        );
    }
}
