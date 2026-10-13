<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::where('is_active', true)->withCount('products')->get());
    }

    public function show($id)
    {
        return $this->success(Brand::with('products')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:120|unique:brands',
            'logo'        => 'nullable|string',
            'description' => 'nullable|string',
            'website'     => 'nullable|string|url',
            'is_active'   => 'nullable|boolean',
        ]);

        $brand = Brand::create($validated);
        return $this->success($brand, 'Brand created', 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'slug'        => 'nullable|string|max:120|unique:brands,slug,' . $id,
            'logo'        => 'nullable|string',
            'description' => 'nullable|string',
            'website'     => 'nullable|string|url',
            'is_active'   => 'nullable|boolean',
        ]);

        $brand->update($validated);
        return $this->success($brand, 'Brand updated');
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();
        return $this->success(null, 'Brand deleted');
    }
}
