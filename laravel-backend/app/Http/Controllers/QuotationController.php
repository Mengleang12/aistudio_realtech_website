<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quotation;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $query = Quotation::query();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->latest()->paginate(20));
    }

    public function show($id)
    {
        return $this->success(Quotation::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:100',
            'items'          => 'required|array',
            'subtotal'       => 'required|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'total_amount'   => 'required|numeric|min:0',
            'valid_until'    => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $quotation = Quotation::create($validated);
        return $this->success($quotation, 'Quotation created', 201);
    }

    public function update(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);
        $validated = $request->validate([
            'customer_name'  => 'sometimes|string|max:150',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:100',
            'items'          => 'sometimes|array',
            'subtotal'       => 'sometimes|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'total_amount'   => 'sometimes|numeric|min:0',
            'status'         => 'sometimes|string',
            'valid_until'    => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $quotation->update($validated);
        return $this->success($quotation, 'Quotation updated');
    }

    public function destroy($id)
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->delete();
        return $this->success(null, 'Quotation deleted');
    }
}
