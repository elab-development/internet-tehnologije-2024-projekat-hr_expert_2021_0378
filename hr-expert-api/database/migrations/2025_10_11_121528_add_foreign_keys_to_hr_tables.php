<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Performance Reviews → Users
        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->foreign('employee_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
            $table->foreign('reviewer_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
        });

        // Leave Requests → Users
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->foreign('employee_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
            $table->foreign('hr_worker_id')
                  ->references('id')->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropForeign(['hr_worker_id']);
        });

        Schema::table('performance_reviews', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropForeign(['reviewer_id']);
        });
    }
};