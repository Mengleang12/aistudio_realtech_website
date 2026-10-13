<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboardSummary()
    {
        $totalSales = Order::where('status', 'completed')->sum('amount');
        $totalOrders = Order::count();
        $totalProducts = Product::where('is_active', true)->count();
        $lowStockCount = Product::where('is_active', true)->where('stock_quantity', '<=', 5)->count();

        $todaySales = Order::where('status', 'completed')
            ->whereDate('created_at', today())
            ->sum('amount');

        return $this->success([
            'total_sales'    => (float) $totalSales,
            'total_orders'   => $totalOrders,
            'total_products' => $totalProducts,
            'low_stock'      => $lowStockCount,
            'today_sales'    => (float) $todaySales,
        ]);
    }

    public function salesReport(Request $request)
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $sales = Order::where('status', 'completed')
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders_count, SUM(amount) as total_amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->success($sales);
    }
}
