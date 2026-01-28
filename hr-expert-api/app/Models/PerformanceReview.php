<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class PerformanceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'reviewer_id',
        'score', 'feedback'
    ];

    // WHO’S BEING REVIEWED
    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    // WHO REVIEWED (an HR or admin user)
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}