<?php

namespace App\Http\Controllers\Voter\Concerns;

use App\Models\OrganizationPosition;

trait SortsByPositionOrder
{
    /**
     * Build a position_name => position_order map so positions can be
     * displayed from the highest position (e.g. President) down to the lowest.
     */
    private function positionOrderMap(): array
    {
        return OrganizationPosition::query()
            ->get()
            ->reduce(function (array $carry, OrganizationPosition $position) {
                $name = $position->position_name;
                $order = $position->position_order ?? PHP_INT_MAX;

                if (! isset($carry[$name]) || $order < $carry[$name]) {
                    $carry[$name] = $order;
                }

                return $carry;
            }, []);
    }
}
