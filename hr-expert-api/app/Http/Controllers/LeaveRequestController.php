<?php

namespace App\Http\Controllers;

use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class LeaveRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->role->name;

        if ($role === 'hr_worker') {
            $requests = LeaveRequest::where('hr_worker_id', $user->id)->get();
        } elseif ($role === 'employee') {
            $requests = LeaveRequest::where('employee_id', $user->id)->get();
        } else {
            return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        return LeaveRequestResource::collection($requests);
    }

    public function show($id)
    {
        $user = Auth::user();
        $lr   = LeaveRequest::findOrFail($id);

        if (
            ($user->role->name === 'employee'  && $lr->employee_id === $user->id) ||
            ($user->role->name === 'hr_worker' && $lr->hr_worker_id === $user->id)
        ) {
            return new LeaveRequestResource($lr);
        }

        return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role->name !== 'employee') {
            return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        $data = $request->validate([
            'start_date'      => 'required|date',
            'end_date'        => 'required|date|after_or_equal:start_date',
            'hr_worker_name'  => 'nullable|string|exists:users,name',
        ]);

        // Resolve hr_worker_id if name given
        $hrWorkerId = null;
        if (! empty($data['hr_worker_name'])) {
            $hrWorker = User::where('name', $data['hr_worker_name'])
                            ->whereHas('role', fn($q) => $q->where('name', 'hr_worker'))
                            ->first();

            // If for some reason the name exists but isn't an HR, block it
            if (! $hrWorker) {
                return response()->json(['error' => 'Korisnik nije HR radnik.'], 422);
            }

            $hrWorkerId = $hrWorker->id;
        }

        $lr = LeaveRequest::create([
            'employee_id'  => $user->id,
            'hr_worker_id' => $hrWorkerId,
            'start_date'   => $data['start_date'],
            'end_date'     => $data['end_date'],
            'status'       => 'pending',
        ]);

        return (new LeaveRequestResource($lr))
                    ->response()
                    ->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $lr   = LeaveRequest::findOrFail($id);

        if ($user->role->name !== 'employee' || $lr->employee_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        $data = $request->validate([
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
        ]);

        $lr->update($data);

        return new LeaveRequestResource($lr);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role->name !== 'hr_worker') {
            return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        $lr = LeaveRequest::findOrFail($id);

        // Provera da li je ovaj zahtev dodeljen baš ovom HR radniku
        if ($lr->hr_worker_id !== $user->id) {
            return response()->json(['error' => 'Niste dodeljeni za ovaj zahtev.'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $lr->update([
            'status' => $data['status'],
            // hr_worker_id ostaje isti, pošto je već dodeljen
        ]);

        return new LeaveRequestResource($lr);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $lr   = LeaveRequest::findOrFail($id);

        $canDelete =
            ($user->role->name === 'employee'  && $lr->employee_id  === $user->id) ||
            ($user->role->name === 'hr_worker' && $lr->hr_worker_id === $user->id);

        if (! $canDelete) {
            return response()->json(['error' => 'Nemate dozvolu za ovu akciju.'], 403);
        }

        $lr->delete();

        return response()->json(['message' => 'Zahtev obrisan.']);
    }
}