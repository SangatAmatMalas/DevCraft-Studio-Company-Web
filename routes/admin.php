<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DesignBriefController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PortfolioProjectController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\Admin\TechnologyController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'active'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/akun', [AccountController::class, 'edit'])->name('account.edit');
        Route::put('/akun', [AccountController::class, 'update'])->name('account.update');

        Route::middleware('can:manage-content')->group(function () {
            Route::resource('portfolio', PortfolioProjectController::class)->except('show')->parameters(['portfolio' => 'project']);
            Route::post('/portfolio/{project}/publish', [PortfolioProjectController::class, 'publish'])->name('portfolio.publish');
            Route::post('/portfolio/{project}/unpublish', [PortfolioProjectController::class, 'unpublish'])->name('portfolio.unpublish');
            Route::get('/portfolio/{project}/preview', [PortfolioProjectController::class, 'preview'])->name('portfolio.preview');

            Route::resource('services', ServiceController::class)->except('show');
            Route::post('/services/{service}/publish', [ServiceController::class, 'publish'])->name('services.publish');
            Route::post('/services/{service}/unpublish', [ServiceController::class, 'unpublish'])->name('services.unpublish');

            Route::resource('packages', PackageController::class)->except('show');
            Route::post('/packages/{package}/publish', [PackageController::class, 'publish'])->name('packages.publish');
            Route::post('/packages/{package}/unpublish', [PackageController::class, 'unpublish'])->name('packages.unpublish');

            Route::resource('faqs', FaqController::class)->except(['show', 'create', 'edit']);
            Route::resource('testimonials', TestimonialController::class)->except(['show', 'create', 'edit']);
            Route::resource('team', TeamMemberController::class)->except(['show'])->parameters(['team' => 'member']);
            Route::resource('pages', PageController::class)->except('show');
            Route::resource('kategori', CategoryController::class)->except(['show', 'create', 'edit'])->parameters(['kategori' => 'category']);
            Route::resource('teknologi', TechnologyController::class)->except(['show', 'create', 'edit'])->parameters(['teknologi' => 'technology']);

            Route::get('/media', [MediaController::class, 'index'])->name('media.index');
            Route::post('/media', [MediaController::class, 'store'])->name('media.store');
            Route::put('/media/{medium}', [MediaController::class, 'update'])->name('media.update');
            Route::delete('/media/{medium}', [MediaController::class, 'destroy'])->name('media.destroy');
        });

        Route::middleware('can:manage-leads')->group(function () {
            Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
            Route::get('/leads/export', [LeadController::class, 'export'])->name('leads.export');
            Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
            Route::get('/leads/{lead}/attachments/{attachment}', [LeadController::class, 'downloadAttachment'])->name('leads.attachments.download');
            Route::patch('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
            Route::post('/leads/{lead}/notes', [LeadController::class, 'storeNote'])->name('leads.notes.store');

            Route::get('/design-briefs', [DesignBriefController::class, 'index'])->name('design-briefs.index');
        });

        Route::get('/activity-logs', [ActivityLogController::class, 'index'])
            ->middleware('can:manage-settings')
            ->name('activity-logs.index');

        Route::middleware('can:manage-settings')->group(function () {
            Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
            Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
        });

        Route::middleware('can:manage-users')->group(function () {
            Route::resource('users', UserController::class)->except(['show']);
        });
    });
