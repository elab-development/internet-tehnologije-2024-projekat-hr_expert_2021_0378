<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,

            'employee' => [
                'id'         => $this->employee->id,
                'name'       => $this->employee->name,
                'department' => $this->employee->department->name,
                'image_url'  => $this->employee->image_url,
            ],

            'reviewer' => [
                'id'         => $this->reviewer->id,
                'name'       => $this->reviewer->name,
                'department' => $this->reviewer->department->name,
                'image_url'  => $this->reviewer->image_url,
            ],

            'score'      => $this->score,
            'feedback'   => $this->feedback,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}