<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@voter.com',
            ],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('admin@123!'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
