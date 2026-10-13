<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(Supplier::withCount('purchases')->get());
    }

    public function show($id)
    {
        return $this->success(Supplier::with('purchases')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:150',
            'company_name'   => 'nullable|string|max:150',
            'contact_person' => 'nullable|string|max:100',
            'email'          => 'nullable|email|max:100',
            'phone'          => 'nullable|string|max:50',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
            'is_active'      => 'nullable|boolean',
        ]);

        $supplier = Supplier::create($validated);
        return $this->success($supplier, 'Supplier created', 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:150',
            'company_name'   => 'nullable|string|max:150',
            'contact_person' => 'nullable|string|max:100',
            'email'          => 'nullable|email|max:100',
            'phone'          => 'nullable|string|max:50',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
            'is_active'      => 'nullable|boolean',
        ]);

        $supplier->update($validated);
        return $this->success($supplier, 'Supplier updated');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return $this->success(null, 'Supplier deleted');
    }
}
