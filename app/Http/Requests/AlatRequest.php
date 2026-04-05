<?php

namespace App\Http\Requests;

use App\Models\Alat;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AlatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Alat|null $alat */
        $alat = $this->route('alat');

        return [
            'kode_barang' => ['nullable', 'string', 'max:50'],
            'nup' => ['nullable', 'integer'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'merk' => ['nullable', 'string', 'max:255'],
            'tipe' => ['nullable', 'string', 'max:255'],
            'kondisi' => ['nullable', 'string', 'in:Baik,Rusak Ringan,Rusak Berat'],
            'status_bmn' => ['nullable', 'string', 'in:Aktif,Tidak Aktif'],
            'nilai_perolehan' => ['nullable', 'numeric'],
            'kode_register' => ['nullable', 'string', 'max:100'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'foto_bergeotag' => ['nullable', 'string', 'max:500'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}