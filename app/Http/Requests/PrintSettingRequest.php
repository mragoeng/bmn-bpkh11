<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrintSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_template' => ['required', 'string', 'max:255'],
            'google_docs_url' => ['nullable', 'url', 'max:2000'],
            'template_content' => ['nullable', 'string'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
