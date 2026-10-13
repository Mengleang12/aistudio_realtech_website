<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\CustomerReceivedNote;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items', 'payments', 'user', 'receivedNotes']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                  ->orWhere('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $perPage = min(100, max(1, (int) $request->get('per_page', 20)));
        $orders = $query->latest()->paginate($perPage);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'payments', 'user', 'receivedNotes'])->findOrFail($id);
        return $this->success($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'    => 'nullable|string|max:150',
            'customer_phone'   => 'nullable|string|max:50',
            'customer_email'   => 'nullable|email|max:150',
            'shipping_address' => 'nullable|string',
            'payment_status'   => 'nullable|string|in:unpaid,partial,paid',
            'payment_method'   => 'nullable|string|max:50',
            'paid_amount'      => 'nullable|numeric|min:0',
            'delivery_fee'     => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
            'warranty_period'  => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id'     => 'nullable|integer',
            'items.*.product_name'   => 'required|string',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.unit_price'     => 'required|numeric|min:0',
            'items.*.discount_type'  => 'nullable|string',
            'items.*.discount_amount'=> 'nullable|numeric|min:0',
            'items.*.variant_label'  => 'nullable|string',
            'items.*.serial_number'  => 'nullable|string',
            'items.*.warranty_text'  => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            foreach ($validated['items'] as $it) {
                $subtotal += ($it['unit_price'] * $it['quantity']);
            }

            $discount = (float) ($validated['discount'] ?? 0);
            $deliveryFee = (float) ($validated['delivery_fee'] ?? 0);
            $grandTotal = max(0, ($subtotal - $discount) + $deliveryFee);
            $paidAmount = (float) ($validated['paid_amount'] ?? 0);

            $paymentStatus = 'unpaid';
            if ($paidAmount >= $grandTotal && $grandTotal > 0) {
                $paymentStatus = 'paid';
            } elseif ($paidAmount > 0) {
                $paymentStatus = 'partial';
            }

            $order = Order::create([
                'user_id'          => $request->user()?->id,
                'customer_name'    => $validated['customer_name'] ?? 'Walk-in Customer',
                'customer_phone'   => $validated['customer_phone'] ?? null,
                'customer_email'   => $validated['customer_email'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'status'           => 'completed',
                'payment_status'   => $paymentStatus,
                'payment_method'   => $validated['payment_method'] ?? 'cash',
                'currency'         => 'USD',
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'delivery_fee'     => $deliveryFee,
                'amount'           => $grandTotal,
                'notes'            => $validated['notes'] ?? null,
                'warranty_period'  => $validated['warranty_period'] ?? null,
                'paid_at'          => $paidAmount > 0 ? now() : null,
            ]);

            foreach ($validated['items'] as $itemData) {
                OrderItem::create([
                    'order_id'        => $order->id,
                    'product_id'      => $itemData['product_id'] ?? null,
                    'product_name'    => $itemData['product_name'],
                    'quantity'        => $itemData['quantity'],
                    'unit_price'      => $itemData['unit_price'],
                    'total_price'     => $itemData['unit_price'] * $itemData['quantity'],
                    'discount_type'   => $itemData['discount_type'] ?? null,
                    'discount_amount' => $itemData['discount_amount'] ?? 0,
                    'variant_label'   => $itemData['variant_label'] ?? null,
                    'serial_number'   => $itemData['serial_number'] ?? null,
                    'warranty_text'   => $itemData['warranty_text'] ?? null,
                ]);

                if (!empty($itemData['product_id'])) {
                    Product::where('id', $itemData['product_id'])
                        ->where('stock_quantity', '>', 0)
                        ->decrement('stock_quantity', $itemData['quantity']);
                }
            }

            if ($paidAmount > 0) {
                OrderPayment::create([
                    'order_id'  => $order->id,
                    'amount'    => $paidAmount,
                    'method'    => $validated['payment_method'] ?? 'cash',
                    'note'      => 'Initial payment recorded on creation',
                    'paid_at'   => now(),
                ]);
            }

            return $this->success($order->load(['items', 'payments']), 'Sale created successfully', 201);
        });
    }

    public function addPayment(Request $request, $id)
    {
        $order = Order::with('payments')->findOrFail($id);

        $validated = $request->validate([
            'amount'    => 'required|numeric|min:0.01',
            'method'    => 'nullable|string|max:50',
            'reference' => 'nullable|string|max:100',
            'note'      => 'nullable|string',
        ]);

        $payment = OrderPayment::create([
            'order_id'  => $order->id,
            'amount'    => $validated['amount'],
            'method'    => $validated['method'] ?? 'cash',
            'reference' => $validated['reference'] ?? null,
            'note'      => $validated['note'] ?? null,
            'paid_at'   => now(),
        ]);

        $totalPaid = $order->payments()->sum('amount');
        if ($totalPaid >= $order->amount) {
            $order->payment_status = 'paid';
            $order->paid_at = now();
        } else {
            $order->payment_status = 'partial';
        }
        $order->save();

        return $this->success($payment, 'Payment recorded successfully');
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->items()->delete();
        $order->payments()->delete();
        $order->delete();

        return $this->success(null, 'Order deleted successfully');
    }
}
