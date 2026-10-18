<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VoterMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // User must be logged in
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // User must be a voter
        if ($request->user()->role !== 'voter') {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
