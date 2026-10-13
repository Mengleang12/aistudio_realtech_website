<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warranty;

class WarrantyController extends Controller
{
    public function index()
    {
        return response()->json(Warranty::where('is_active', true)->get());
    }

    public function show($id)
    {
        return $this->success(Warranty::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'duration_days' => 'required|integer|min:0',
            'policy'        => 'nullable|string',
            'is_active'     => 'nullable|boolean',
        ]);

        $warranty = Warranty::create($validated);
        return $this->success($warranty, 'Warranty policy created', 201);
    }

    public function update(Request $request, $id)
    {
        $warranty = Warranty::findOrFail($id);
        $validated = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'duration_days' => 'sometimes|integer|min:0',
            'policy'        => 'nullable|string',
            'is_active'     => 'nullable|boolean',
        ]);

        $warranty->update($validated);
        return $this->success($warranty, 'Warranty policy updated');
    }

    public function destroy($id)
    {
        $warranty = Warranty::findOrFail($id);
        $warranty->delete();
        return $this->success(null, 'Warranty policy deleted');
    }
}
