<?php

namespace App\Http\Controllers;

use App\Constants\PermissionConstant as Permission;
use App\Enums\RoleEnum;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\SaveAdminRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(sprintf('permission:%s', Permission::BROWSE_ADMINS))->only('index');
        $this->middleware(sprintf('permission:%s', Permission::READ_ADMIN))->only('show');
        $this->middleware(sprintf('permission:%s', Permission::ADD_ADMIN))->only('store');
        $this->middleware(sprintf('permission:%s', Permission::EDIT_ADMIN))->only(['update', 'resetPassword']);
        $this->middleware(sprintf('permission:%s', Permission::DELETE_ADMIN))->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with(['roles'])
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', [RoleEnum::SuperAdmin->value, RoleEnum::Admin->value]);
            })
            ->search($request->input('search'))
            ->latest();
        $paginate = $request->boolean('paginate', true);

        return inertia('admin/Index', [
            'users' => Inertia::defer(fn() => ! $paginate
                ? $query->get()->each->append('role_translated')->makeHidden('roles')
                : $query->paginate()->through(fn($user) => $user->append('role_translated')->makeHidden('roles'))->withQueryString()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveAdminRequest $request): RedirectResponse
    {
        $user = User::create($request->validated());
        $user->assignRole($request->input('role'));

        return redirect()
            ->route('admins.show', $user)
            ->with('success', __('app.created_data', ['data' => __('app.user')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(User $admin): Response
    {
        return inertia('admin/Show', [
            'user' => $admin->append('role_translated', 'role')->makeHidden('roles'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaveAdminRequest $request, User $admin): RedirectResponse
    {
        $admin->update($request->validated());
        $admin->syncRoles($request->input('role'));

        return redirect()
            ->route('admins.show', $admin)
            ->with('success', __('app.updated_data', ['data' => __('app.user')]));
    }

    public function destroy(User $admin): RedirectResponse
    {
        $admin->delete();

        return redirect()
            ->route('admins.index')
            ->with('success', __('app.deleted_data', ['data' => __('app.user')]));
    }

    public function resetPassword(ResetPasswordRequest $request, User $admin): RedirectResponse
    {
        $admin->update([
            'password' => Hash::make($request->get('password')),
        ]);

        return redirect()
            ->route('admins.show', $admin)
            ->with('success', __('app.updated_data', ['data' => __('app.user')]));
    }
}
