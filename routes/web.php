<?php

use App\Http\Controllers\Site\AboutController;
use App\Http\Controllers\Site\AnalyticsController;
use App\Http\Controllers\Site\ContactController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\PackageController;
use App\Http\Controllers\Site\PageController;
use App\Http\Controllers\Site\PortfolioController;
use App\Http\Controllers\Site\ServiceController;
use App\Http\Controllers\Site\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/layanan', [ServiceController::class, 'index'])->name('layanan.index');
Route::get('/layanan/{service}', [ServiceController::class, 'show'])->name('layanan.show');

Route::get('/paket', [PackageController::class, 'index'])->name('paket.index');
Route::get('/paket/bandingkan', [PackageController::class, 'compare'])->name('paket.compare');
Route::get('/paket/{package}', [PackageController::class, 'show'])->name('paket.show');

Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{project}', [PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/tentang-kami', [AboutController::class, 'index'])->name('tentang');
Route::get('/kebijakan-privasi', [PageController::class, 'show'])->defaults('slug', 'kebijakan-privasi')->name('privasi');

Route::get('/kontak', [ContactController::class, 'show'])->name('kontak');
Route::post('/kontak', [ContactController::class, 'store'])
    ->middleware('throttle:lead-submissions')
    ->name('kontak.store');

Route::post('/analytics/event', [AnalyticsController::class, 'store'])
    ->middleware('throttle:120,1')
    ->name('analytics.event');

Route::get('/sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// Published content pages (about, privacy policy, future pages) live at the root.
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';

// Keep the catch-all last so it never shadows admin, auth, or other routes.
Route::get('/{slug}', [PageController::class, 'show'])->name('page.show');
