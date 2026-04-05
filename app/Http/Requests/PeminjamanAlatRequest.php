<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PeminjamanAlatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alat_id' => ['required', 'exists:alat,id'],
            'pegawai_id' => ['required', 'exists:pegawai,id'],
            'tanggal_pinjam' => ['required', 'date'],
            'tanggal_kembali_rencana' => ['required', 'date', 'after_or_equal:tanggal_pinjam'],
            'keperluan' => ['required', 'string'],
            'catatan' => ['nullable', 'string'],
            'tanggal_kembali_aktual' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'alat_id.required' => 'Alat harus dipilih.',
            'alat_id.exists' => 'Alat tidak ditemukan.',
            'pegawai_id.required' => 'Pegawai harus dipilih.',
            'pegawai_id.exists' => 'Pegawai tidak ditemukan.',
            'tanggal_pinjam.required' => 'Tanggal pinjam harus diisi.',
            'tanggal_pinjam.date' => 'Format tanggal pinjam tidak valid.',
            'tanggal_kembali_rencana.required' => 'Tanggal kembali rencana harus diisi.',
            'tanggal_kembali_rencana.date' => 'Format tanggal kembali rencana tidak valid.',
            'tanggal_kembali_rencana.after_or_equal' => 'Tanggal kembali rencana harus sama atau setelah tanggal pinjam.',
            'keperluan.required' => 'Keperluan harus diisi.',
        ];
    }
}