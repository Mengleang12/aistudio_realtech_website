<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SerialNumber;

class SerialController extends Controller
{
    public function index(Request $request)
    {
        $query = SerialNumber::with('product');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('serial_number', 'like', "%{$s}%");
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'serial_number' => 'required|string|max:100|unique:serial_numbers,serial_number',
            'status'        => 'nullable|string|in:available,sold,defective,returned',
            'notes'         => 'nullable|string',
        ]);

        $serial = SerialNumber::create([
            'product_id'    => $validated['product_id'],
            'serial_number' => $validated['serial_number'],
            'status'        => $validated['status'] ?? 'available',
            'notes'         => $validated['notes'] ?? null,
        ]);

        return $this->success($serial, 'Serial number recorded', 201);
    }

    public function update(Request $request, $id)
    {
        $serial = SerialNumber::findOrFail($id);
        $validated = $request->validate([
            'serial_number' => 'sometimes|string|max:100|unique:serial_numbers,serial_number,' . $id,
            'status'        => 'nullable|string|in:available,sold,defective,returned',
            'notes'         => 'nullable|string',
        ]);

        $serial->update($validated);
        return $this->success($serial, 'Serial number updated');
    }

    public function destroy($id)
    {
        $serial = SerialNumber::findOrFail($id);
        $serial->delete();
        return $this->success(null, 'Serial number deleted');
    }
}
