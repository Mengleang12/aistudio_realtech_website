<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Slider;

class SliderController extends Controller
{
    public function index()
    {
        return response()->json(Slider::where('is_active', true)->orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:150',
            'subtitle'   => 'nullable|string|max:255',
            'image_url'  => 'required|string',
            'link_url'   => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $slider = Slider::create($validated);
        return $this->success($slider, 'Slider created', 201);
    }

    public function update(Request $request, $id)
    {
        $slider = Slider::findOrFail($id);
        $validated = $request->validate([
            'title'      => 'sometimes|string|max:150',
            'subtitle'   => 'nullable|string|max:255',
            'image_url'  => 'sometimes|string',
            'link_url'   => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $slider->update($validated);
        return $this->success($slider, 'Slider updated');
    }

    public function destroy($id)
    {
        $slider = Slider::findOrFail($id);
        $slider->delete();
        return $this->success(null, 'Slider deleted');
    }
}
