<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\PerformanceReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\UserController;

Route::get('/roles',       [RolesController::class,       'index']);
Route::get('/departments', [DepartmentsController::class, 'index']);

Route::get('/roles/{id}',  [RolesController::class,       'show']);
Route::get('/departments/{id}', [DepartmentsController::class, 'show']);

Route::get('/users', [UserController::class, 'index']);

Route::post('/register',[AuthController::class,'register']);
Route::post('/login', [AuthController::class, 'login']);

//zasticena grupna ruta
Route::group(['middleware' => ['auth:sanctum']], function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Leave Requests
    Route::get('/leave-requests',                     [LeaveRequestController::class, 'index']);
    Route::get('/leave-requests/{id}',                [LeaveRequestController::class, 'show']);
    Route::post('/leave-requests',                    [LeaveRequestController::class, 'store']);
    Route::put('/leave-requests/{id}',                [LeaveRequestController::class, 'update']);
    Route::patch('/leave-requests/{id}/status',       [LeaveRequestController::class, 'updateStatus']);
    Route::delete('/leave-requests/{id}',             [LeaveRequestController::class, 'destroy']);

    // Performance Reviews
    // Standard CRUD (index, show, store, update, destroy)
    Route::apiResource('performance-reviews', PerformanceReviewController::class)
         ->parameters(['performance-reviews' => 'id']);

    // Custom PDF export
    Route::get(
        'performance-reviews/{id}/export-pdf',
        [PerformanceReviewController::class, 'exportToPDF']
    );

        // Admin only
    Route::get('/admin/metrics',       [AdminController::class, 'getMetrics']);
    Route::get('/admin/users',         [AdminController::class, 'getUsers']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'removeUser']);
});