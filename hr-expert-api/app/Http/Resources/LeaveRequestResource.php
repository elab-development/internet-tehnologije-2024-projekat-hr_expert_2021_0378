<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,

            'employee'     => [
                'id'         => $this->employee->id,
                'name'       => $this->employee->name,
                'department' => $this->employee->department->name,
                'image_url' => $this->employee->image_url,
            ],

            'hr_worker'    => $this->hr_worker_id
                ? [
                    'id'         => $this->hrWorker->id,
                    'name'       => $this->hrWorker->name,
                    'department' => $this->hrWorker->department->name,
                    'image_url' => $this->hrWorker->image_url,
                ]
                : null,

            'start_date'   => $this->start_date,
            'end_date'     => $this->end_date,
            'status'       => $this->status,
            'created_at'   => $this->created_at->toDateTimeString(),
            'updated_at'   => $this->updated_at->toDateTimeString(),
        ];
    }
}