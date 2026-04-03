<?php

namespace App\Http\Requests;

use App\Models\Kendaraan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KendaraanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Kendaraan|null $kendaraan */
        $kendaraan = $this->route('kendaraan');

        return [
            'kode_kendaraan' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('kendaraan', 'kode_kendaraan')->ignore($kendaraan?->id),
            ],
            'nomor_polisi' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kendaraan', 'nomor_polisi')->ignore($kendaraan?->id),
            ],
            'merk_tipe' => ['required', 'string', 'max:255'],
            'jenis_kendaraan' => ['required', Rule::in(['roda_2', 'roda_4'])],
            'tahun' => ['nullable', 'integer', 'between:1900,2100'],
            'jenis_bbm_default' => ['nullable', 'string', 'max:100'],
            'pegawai_id' => ['nullable', 'exists:pegawai,id'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
