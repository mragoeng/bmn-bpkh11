<?php

namespace App\Http\Requests;

use App\Models\KelompokAkunPembayaran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KelompokAkunPembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var KelompokAkunPembayaran|null $akun */
        $akun = $this->route('akun');

        return [
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'jenis_kendaraan' => [
                'required',
                Rule::in(['roda_2', 'roda_4']),
                Rule::unique('kelompok_akun_pembayaran', 'jenis_kendaraan')
                    ->where(fn ($query) => $query->where('tahun', $this->integer('tahun')))
                    ->ignore($akun?->id),
            ],
            'kode_akun' => ['required', 'string', 'max:100'],
            'nama_akun' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
