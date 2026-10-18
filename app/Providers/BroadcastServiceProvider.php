<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::routes();

        /*
         * Channel that all admins listen on for real-time voter activity.
         * Only admin users may authenticate to this private channel.
         */
        Broadcast::channel('admin.notifications', function ($user) {
            return $user->role === 'admin';
        });
    }
}
