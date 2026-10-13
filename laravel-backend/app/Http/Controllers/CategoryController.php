<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::where('is_active', true)->withCount('products')->orderBy('sort_order')->get());
    }

    public function show($id)
    {
        return $this->success(Category::with('products')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:120|unique:categories',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string',
            'image'       => 'nullable|string',
            'sort_order'  => 'nullable|integer',
            'is_active'   => 'nullable|boolean',
        ]);

        $category = Category::create($validated);
        return $this->success($category, 'Category created', 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'slug'        => 'nullable|string|max:120|unique:categories,slug,' . $id,
            'description' => 'nullable|string',
            'icon'        => 'nullable|string',
            'image'       => 'nullable|string',
            'sort_order'  => 'nullable|integer',
            'is_active'   => 'nullable|boolean',
        ]);

        $category->update($validated);
        return $this->success($category, 'Category updated');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return $this->success(null, 'Category deleted');
    }
}
