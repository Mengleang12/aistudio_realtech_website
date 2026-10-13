<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SerialController;
use App\Http\Controllers\WarrantyController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\SliderController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ReceivedNoteController;

/*
|--------------------------------------------------------------------------
| API Routes - AppsTorrent / Realtech Computer
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Public store endpoints
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::get('/sliders', [SliderController::class, 'index']);
Route::get('/warranties', [WarrantyController::class, 'index']);
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
Route::get('/admin/settings/branding', [SettingsController::class, 'getBranding']);

// Orders & Checkout
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::post('/orders/{id}/payments', [OrderController::class, 'addPayment']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

// Customer Received Notes
Route::get('/received-notes', [ReceivedNoteController::class, 'index']);
Route::get('/received-notes/{id}', [ReceivedNoteController::class, 'show']);
Route::post('/received-notes', [ReceivedNoteController::class, 'store']);
Route::delete('/received-notes/{id}', [ReceivedNoteController::class, 'destroy']);

// Product Management
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Category & Brand Management
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::post('/brands', [BrandController::class, 'store']);
Route::put('/brands/{id}', [BrandController::class, 'update']);
Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

// Serial Numbers
Route::get('/serials', [SerialController::class, 'index']);
Route::post('/serials', [SerialController::class, 'store']);
Route::put('/serials/{id}', [SerialController::class, 'update']);
Route::delete('/serials/{id}', [SerialController::class, 'destroy']);

// Warranties
Route::post('/warranties', [WarrantyController::class, 'store']);
Route::put('/warranties/{id}', [WarrantyController::class, 'update']);
Route::delete('/warranties/{id}', [WarrantyController::class, 'destroy']);

// Suppliers & Purchases
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
Route::post('/suppliers', [SupplierController::class, 'store']);
Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

Route::get('/purchases', [PurchaseController::class, 'index']);
Route::get('/purchases/{id}', [PurchaseController::class, 'show']);
Route::post('/purchases', [PurchaseController::class, 'store']);
Route::post('/purchases/{id}/receive', [PurchaseController::class, 'receiveItems']);

// Quotations
Route::get('/quotations', [QuotationController::class, 'index']);
Route::get('/quotations/{id}', [QuotationController::class, 'show']);
Route::post('/quotations', [QuotationController::class, 'store']);
Route::put('/quotations/{id}', [QuotationController::class, 'update']);
Route::delete('/quotations/{id}', [QuotationController::class, 'destroy']);

// Coupons
Route::get('/coupons', [CouponController::class, 'index']);
Route::post('/coupons', [CouponController::class, 'store']);
Route::put('/coupons/{id}', [CouponController::class, 'update']);
Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);

// Sliders
Route::post('/sliders', [SliderController::class, 'store']);
Route::put('/sliders/{id}', [SliderController::class, 'update']);
Route::delete('/sliders/{id}', [SliderController::class, 'destroy']);

// Uploads
Route::post('/upload', [UploadController::class, 'upload']);

// Analytics & Reports
Route::get('/analytics/dashboard', [ReportController::class, 'dashboardSummary']);
Route::get('/reports/sales', [ReportController::class, 'salesReport']);
