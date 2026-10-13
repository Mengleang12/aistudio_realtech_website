<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::with(['supplier', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function show($id)
    {
        return $this->success(Purchase::with(['supplier', 'items.product'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id'        => 'required|exists:suppliers,id',
            'status'             => 'nullable|string|in:ordered,partial,received,cancelled',
            'delivery_fee'       => 'nullable|numeric|min:0',
            'other_expense'      => 'nullable|numeric|min:0',
            'other_expense_note' => 'nullable|string',
            'notes'              => 'nullable|string',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_cost'  => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $it) {
                $totalAmount += ($it['quantity'] * $it['unit_cost']);
            }

            $purchase = Purchase::create([
                'supplier_id'        => $validated['supplier_id'],
                'status'             => $validated['status'] ?? 'ordered',
                'total_amount'       => $totalAmount,
                'delivery_fee'       => $validated['delivery_fee'] ?? 0,
                'other_expense'      => $validated['other_expense'] ?? 0,
                'other_expense_note' => $validated['other_expense_note'] ?? null,
                'notes'              => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                PurchaseItem::create([
                    'purchase_id'       => $purchase->id,
                    'product_id'        => $itemData['product_id'],
                    'product_name'      => $product?->name ?? 'Product',
                    'quantity'          => $itemData['quantity'],
                    'received_quantity' => 0,
                    'unit_cost'         => $itemData['unit_cost'],
                    'total_cost'        => $itemData['quantity'] * $itemData['unit_cost'],
                ]);
            }

            return $this->success($purchase->load('items'), 'Purchase order created', 201);
        });
    }

    public function receiveItems(Request $request, $id)
    {
        $purchase = Purchase::with('items')->findOrFail($id);
        $validated = $request->validate([
            'items'                     => 'required|array',
            'items.*.item_id'           => 'required|exists:purchase_items,id',
            'items.*.received_quantity' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($purchase, $validated) {
            $allReceived = true;
            foreach ($validated['items'] as $itemInput) {
                $item = PurchaseItem::find($itemInput['item_id']);
                if ($item && $item->purchase_id === $purchase->id) {
                    $item->received_quantity = $itemInput['received_quantity'];
                    $item->save();

                    Product::where('id', $item->product_id)->increment('stock_quantity', $itemInput['received_quantity']);

                    if ($item->received_quantity < $item->quantity) {
                        $allReceived = false;
                    }
                }
            }

            $purchase->status = $allReceived ? 'received' : 'partial';
            if ($allReceived) {
                $purchase->received_at = now();
            }
            $purchase->save();

            return $this->success($purchase->load('items'), 'Items received and inventory updated');
        });
    }
}
