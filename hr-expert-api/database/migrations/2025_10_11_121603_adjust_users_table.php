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
        Schema::table('users', function (Blueprint $table) {
            // Add role and department
            $table->foreignId('role_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('roles')
                  ->onDelete('set null');

            $table->foreignId('department_id')
                  ->nullable()
                  ->after('role_id')
                  ->constrained('departments')
                  ->onDelete('set null');
            $table->string('image_url')->nullable()->after('department_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('image_url');

            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');

            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};