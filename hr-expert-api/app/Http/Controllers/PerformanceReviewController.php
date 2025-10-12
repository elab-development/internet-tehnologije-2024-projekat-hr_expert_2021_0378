<?php

namespace App\Http\Controllers;

use App\Http\Resources\PerformanceReviewResource;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Barryvdh\DomPDF\Facade\Pdf;

class PerformanceReviewController extends Controller
{
    /**
     * List all reviews for the current user (as employee or as reviewer).
     */
    public function index()
    {
        $user = Auth::user();
        $role = $user->role->name;

        if ($role === 'employee') {
            $reviews = PerformanceReview::where('employee_id', $user->id)->get();
        } elseif (in_array($role, ['hr_worker', 'administrator'])) {
            $reviews = PerformanceReview::where('reviewer_id', $user->id)->get();
        } else {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        return PerformanceReviewResource::collection($reviews);
    }

    /**
     * Show one review (if you’re the employee or the reviewer).
     */
    public function show($id)
    {
        $user   = Auth::user();
        $review = PerformanceReview::findOrFail($id);

        if (
            ($user->role->name === 'employee'      && $review->employee_id === $user->id) ||
            (in_array($user->role->name, ['hr_worker', 'administrator']) &&
             $review->reviewer_id === $user->id)
        ) {
            return new PerformanceReviewResource($review);
        }

        return response()->json(['error' => 'Nemate dozvolu.'], 403);
    }

    /**
     * Create a new review (only HR workers or admins).
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (! in_array($user->role->name, ['hr_worker', 'administrator'])) {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $data = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'score'       => 'required|integer|min:1|max:5',
            'feedback'    => 'required|string',
        ]);

        $review = PerformanceReview::create([
            'employee_id' => $data['employee_id'],
            'reviewer_id' => $user->id,
            'score'       => $data['score'],
            'feedback'    => $data['feedback'],
        ]);

        return (new PerformanceReviewResource($review))
                    ->response()
                    ->setStatusCode(201);
    }

    /**
     * Update feedback or other fields (only creator HR/admin).
     */
    public function update(Request $request, $id)
    {
        $user   = Auth::user();
        $review = PerformanceReview::findOrFail($id);

        if (! in_array($user->role->name, ['hr_worker', 'administrator']) ||
             $review->reviewer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $data = $request->validate([
            'score'    => 'sometimes|integer|min:1|max:5',
            'feedback' => 'sometimes|string',
        ]);

        $review->update($data);

        return new PerformanceReviewResource($review);
    }

    /**
     * Delete a review (only creator HR/admin).
     */
    public function destroy($id)
    {
        $user   = Auth::user();
        $review = PerformanceReview::findOrFail($id);

        if (! in_array($user->role->name, ['hr_worker', 'administrator']) ||
             $review->reviewer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Performance review obrisan.']);
    }

    /**
     * Export a single review to PDF (if you can view it).
     * Hardened with eager loading, view existence check, and try/catch
     * so frontend receives a clear JSON error instead of a generic 500 blob.
     */
    public function exportToPDF($id)
    {
        $user = Auth::user();

        // Eager-load relations used in the PDF to avoid lazy-loading issues.
        $review = PerformanceReview::with(['employee', 'reviewer'])->findOrFail($id);

        // Same permission check as `show`
        if (
            !(
                ($user->role->name === 'employee' && $review->employee_id === $user->id) ||
                (in_array($user->role->name, ['hr_worker', 'administrator']) && $review->reviewer_id === $user->id)
            )
        ) {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        try {
            // Ensure the view exists; fail fast with a readable message.
            $viewName = 'pdf.performance_review';
            if (! View::exists($viewName)) {
                return response()->json([
                    'message' => 'PDF view ne postoji.',
                    'hint'    => "Kreirajte resources/views/pdf/performance_review.blade.php"
                ], 500);
            }

            $pdf = Pdf::setOptions([
                'isRemoteEnabled'     => true,   // allow http(s) images if you add logos
                'isHtml5ParserEnabled'=> true,   // better CSS support
            ])->loadView($viewName, [
                'review' => $review, // Blade can use optional() to guard nulls
            ])->setPaper('a4');

            // You can also return ->stream() if you prefer inline
            return $pdf->download("performance_review_{$review->id}.pdf");
        } catch (\Throwable $e) {
            // Return JSON so the frontend can display the real error
            return response()->json([
                'message' => 'Neuspešno generisanje PDF-a.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
