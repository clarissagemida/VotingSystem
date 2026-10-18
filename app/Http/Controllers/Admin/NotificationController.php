<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return the latest notifications and the unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);

        $totalUnread = AdminNotification::query()
            ->unread()
            ->count();

        $notifications = AdminNotification::query()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn (AdminNotification $notification) => $this->toPayload($notification));

        return response()->json([
            'unread' => $totalUnread,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark every notification as read.
     */
    public function markAllRead(): JsonResponse
    {
        AdminNotification::query()
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(AdminNotification $notification): JsonResponse
    {
        $notification->update([
            'read_at' => $notification->read_at ?? now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    private function toPayload(AdminNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'action' => $notification->action,
            'title' => $notification->title,
            'message' => $notification->message,
            'voter' => $notification->voter_name,
            'election' => $notification->election,
            'read' => $notification->read_at !== null,
            'created_at' => $notification->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
