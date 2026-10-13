<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('featured') && $request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%")
                  ->orWhere('barcode', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        $perPage = min(100, max(1, (int) $request->get('per_page', 24)));
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'serials'])->find($id);

        if (!$product) {
            $product = Product::with(['category', 'brand', 'serials'])->where('slug', $id)->first();
        }

        if (!$product) {
            return $this->error('Product not found', 404);
        }

        return $this->success($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'sku'             => 'nullable|string|max:100|unique:products',
            'barcode'         => 'nullable|string|max:100',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'original_price'  => 'nullable|numeric|min:0',
            'cost_price'      => 'nullable|numeric|min:0',
            'stock_quantity'  => 'nullable|integer|min:0',
            'category_id'     => 'nullable|exists:categories,id',
            'brand_id'        => 'nullable|exists:brands,id',
            'image_url'       => 'nullable|string',
            'images'          => 'nullable|array',
            'is_active'       => 'nullable|boolean',
            'is_featured'     => 'nullable|boolean',
            'warranty_period' => 'nullable|string',
            'specifications'  => 'nullable|array',
        ]);

        $product = Product::create($validated);

        return $this->success($product, 'Product created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'sku'             => 'nullable|string|max:100|unique:products,sku,' . $id,
            'barcode'         => 'nullable|string|max:100',
            'description'     => 'nullable|string',
            'price'           => 'sometimes|numeric|min:0',
            'original_price'  => 'nullable|numeric|min:0',
            'cost_price'      => 'nullable|numeric|min:0',
            'stock_quantity'  => 'nullable|integer|min:0',
            'category_id'     => 'nullable|exists:categories,id',
            'brand_id'        => 'nullable|exists:brands,id',
            'image_url'       => 'nullable|string',
            'images'          => 'nullable|array',
            'is_active'       => 'nullable|boolean',
            'is_featured'     => 'nullable|boolean',
            'warranty_period' => 'nullable|string',
            'specifications'  => 'nullable|array',
        ]);

        $product->update($validated);

        return $this->success($product, 'Product updated successfully');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }
}
