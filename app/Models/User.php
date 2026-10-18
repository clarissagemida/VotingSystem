<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Mass assignable attributes.
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
    ];

    /**
     * Hidden attributes.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casts.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Generate a unique voter username.
     */
    public static function generateUsername(string $name): string
    {
        $base = strtolower(
            preg_replace('/[^a-zA-Z0-9]/', '', $name) ?? ''
        );

        $base = $base ?: 'voter';

        do {
            $username = $base.strtolower(
                substr(
                    str_shuffle(
                        'abcdefghijklmnopqrstuvwxyz0123456789'
                    ),
                    0,
                    4
                )
            );
        } while (
            self::where('username', $username)->exists()
        );

        return $username;
    }

    /**
     * Generate a random voter password.
     */
    public static function generatePassword(): string
    {
        $characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.
            'abcdefghijklmnopqrstuvwxyz'.
            '0123456789@#$%&*';

        $password = '';

        for ($i = 0; $i < 10; $i++) {
            $password .= $characters[
                random_int(0, strlen($characters) - 1)
            ];
        }

        return $password;
    }
}
