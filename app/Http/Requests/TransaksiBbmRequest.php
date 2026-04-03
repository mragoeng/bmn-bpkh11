<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransaksiBbmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'pegawai_id' => ['required', 'exists:pegawai,id'],
            'kendaraan_id' => ['required', 'exists:kendaraan,id'],
            'akun_pembayaran_id' => ['nullable', 'exists:kelompok_akun_pembayaran,id'],
            'odometer' => ['nullable', 'numeric', 'min:0'],
            'jenis_bbm' => ['required', 'string', 'max:100'],
            'liter' => ['required', 'numeric', 'min:0.01'],
            'harga_per_liter' => ['required', 'numeric', 'min:0'],
            'spbu' => ['nullable', 'string', 'max:255'],
            'nomor_nota' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string'],
        ];
    }
}
