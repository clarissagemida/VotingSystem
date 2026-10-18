<?php

namespace App\Support;

use App\Events\VoterActivity;
use App\Models\AdminNotification;

class VoterNotifier
{
    /**
     * Record a voter activity notification and broadcast it to admins.
     *
     * @param  array{action: string, title: string, message: string, voter_name?: string|null, election?: string|null}  $data
     */
    public static function record(array $data): AdminNotification
    {
        $notification = AdminNotification::create([
            'voter_name' => $data['voter_name'] ?? null,
            'action' => $data['action'],
            'title' => $data['title'],
            'message' => $data['message'],
            'election' => $data['election'] ?? null,
        ]);

        try {
            broadcast(new VoterActivity($notification));
        } catch (\Throwable $e) {
            // The real-time server may be offline; the notification is
            // still persisted so it appears on the next fetch.
        }

        return $notification;
    }
}
