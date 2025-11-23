<?php

namespace App\Http\Controllers;

use App\Constants\PermissionConstant as Permission;
use App\Enums\RoleEnum;
use App\Http\Requests\StoreUserAttendanceRequest;
use App\Http\Services\FaceRecognitionService;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserAttendanceController extends Controller
{
    public function __construct()
    {
        $this->middleware(sprintf('permission:%s', Permission::BROWSE_USER_ATTENDANCES))->only('index');
        $this->middleware(sprintf('permission:%s', Permission::READ_USER_ATTENDANCE))->only('show');
        $this->middleware(sprintf('permission:%s', Permission::ADD_USER_ATTENDANCE))->only(['store', 'create']);
        $this->middleware(sprintf('permission:%s', Permission::EDIT_USER_ATTENDANCE))->only('validate');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Attendance::query()
            ->with('user')
            ->userId($request->input('user_id'))
            ->since($request->get('since'), now()->subDays(30))
            ->until($request->get('until'), now())
            ->latest();
        $paginate = $request->boolean('paginate', true);

        return inertia('user-attendance/Index', [
            'attendances' => Inertia::defer(fn() => ! $paginate
                ? $query->get()->each->append('time')
                : $query->paginate()->through(fn($model) => $model->append('time'))->withQueryString()),
        ]);
    }

    public function create(Request $request)
    {
        $userQuery = User::whereHas('roles', fn($query) => $query->where('name', RoleEnum::User->value))->latest();

        return inertia('user-attendance/Create', [
            'users' => Inertia::defer(fn() => $userQuery->get()),
        ]);
    }

    public function store(StoreUserAttendanceRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = User::findOrFail($request->input('user_id'));

        $attendance = DB::transaction(function () use ($request, $user) {
            /** @var Attendance */
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'date' => $request->input('date'),
                'check_in' => $request->input('check_in'),
                'check_out' => $request->input('check_out'),
            ]);

            if ($request->hasFile('check_in_photo')) {
                $attendance->addMedia($request->file('check_in_photo'))
                    ->toMediaCollection('check-in-photo');
            }

            if ($request->hasFile('check_out_photo')) {
                $attendance->addMedia($request->file('check_out_photo'))
                    ->toMediaCollection('check-out-photo');
            }

            return $attendance;
        });

        return redirect()
            ->route('user-attendances.show', $attendance)
            ->with('success', 'Attendance created successfully.');
    }

    public function show(Attendance $userAttendance)
    {
        $userAttendance->load(['user', 'media']);

        $userAttendance->user->append('photo_urls');
        $userAttendance->append('check_in_photo_url', 'check_out_photo_url');
        $userAttendance->makeHidden('media');

        return inertia('user-attendance/Show', [
            'attendance' => $userAttendance,
        ]);
    }

    public function validate(Attendance $userAttendance)
    {
        /** @var \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection */
        $references = $userAttendance->user->getMedia('face-reference');
        $checkInPhoto = $userAttendance->getFirstMedia('check-in-photo');
        $checkOutPhoto = $userAttendance->getFirstMedia('check-out-photo');

        if ($references->isEmpty()) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'No face reference found for this user.']);
        }

        if ($checkInPhoto === null || $checkOutPhoto === null) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Check-in or check-out photo not found.']);
        }

        $faceRecognitionService = new FaceRecognitionService();
        $checkInResponse = $faceRecognitionService->recognizeAll($checkInPhoto, $references);
        $checkOutResponse = $faceRecognitionService->recognizeAll($checkOutPhoto, $references);

        $userAttendance->update([
            'check_in_photo_distance' => $checkInResponse->json('distance'),
            'check_out_photo_distance' => $checkOutResponse->json('distance'),
        ]);

        return redirect()
            ->back();
    }
}
