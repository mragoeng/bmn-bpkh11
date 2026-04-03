<?php

namespace App\Services;

use App\Models\KelompokAkunPembayaran;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use App\Models\TransaksiBbm;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class CsvImportService
{
    public function importPegawai(UploadedFile $file): array
    {
        return DB::transaction(function () use ($file) {
            $result = [
                'total' => 0,
                'created' => 0,
                'updated' => 0,
            ];

            foreach ($this->rows($file) as $rowNumber => $row) {
                $payload = [
                    'nip' => $this->nullableString($this->value($row, ['nip'])),
                    'nama' => $this->requiredString($row, ['nama'], 'nama', $rowNumber),
                    'jabatan' => $this->nullableString($this->value($row, ['jabatan'])),
                    'unit' => $this->nullableString($this->value($row, ['unit'])),
                    'keterangan' => $this->nullableString($this->value($row, ['keterangan'])),
                ];

                $this->validateRow($payload, [
                    'nip' => ['nullable', 'string', 'max:50'],
                    'nama' => ['required', 'string', 'max:255'],
                    'jabatan' => ['nullable', 'string', 'max:255'],
                    'unit' => ['nullable', 'string', 'max:255'],
                    'keterangan' => ['nullable', 'string'],
                ], $rowNumber);

                $pegawai = $payload['nip']
                    ? Pegawai::query()->firstOrNew(['nip' => $payload['nip']])
                    : Pegawai::query()->firstOrNew(['nama' => $payload['nama']]);

                $isExisting = $pegawai->exists;
                $pegawai->fill($payload)->save();

                $result['total']++;
                $result[$isExisting ? 'updated' : 'created']++;
            }

            return $result;
        });
    }

    public function importKendaraan(UploadedFile $file): array
    {
        return DB::transaction(function () use ($file) {
            $result = [
                'total' => 0,
                'created' => 0,
                'updated' => 0,
            ];

            foreach ($this->rows($file) as $rowNumber => $row) {
                $pegawaiId = $this->resolvePegawaiId($row, $rowNumber, false);

                $payload = [
                    'kode_kendaraan' => $this->nullableString($this->value($row, ['kode_kendaraan', 'kode_aset'])),
                    'nomor_polisi' => $this->requiredString($row, ['nomor_polisi', 'nopol'], 'nomor_polisi', $rowNumber),
                    'merk_tipe' => $this->requiredString($row, ['merk_tipe', 'merk', 'tipe'], 'merk_tipe', $rowNumber),
                    'jenis_kendaraan' => $this->normalizeJenisKendaraan(
                        $this->requiredString($row, ['jenis_kendaraan'], 'jenis_kendaraan', $rowNumber),
                        $rowNumber,
                    ),
                    'tahun' => $this->nullableInteger($this->value($row, ['tahun'])),
                    'jenis_bbm_default' => $this->nullableString($this->value($row, ['jenis_bbm_default', 'jenis_bbm'])),
                    'pegawai_id' => $pegawaiId,
                    'keterangan' => $this->nullableString($this->value($row, ['keterangan'])),
                ];

                $this->validateRow($payload, [
                    'kode_kendaraan' => ['nullable', 'string', 'max:100'],
                    'nomor_polisi' => ['required', 'string', 'max:100'],
                    'merk_tipe' => ['required', 'string', 'max:255'],
                    'jenis_kendaraan' => ['required', 'in:roda_2,roda_4'],
                    'tahun' => ['nullable', 'integer', 'between:1900,2100'],
                    'jenis_bbm_default' => ['nullable', 'string', 'max:100'],
                    'pegawai_id' => ['nullable', 'exists:pegawai,id'],
                    'keterangan' => ['nullable', 'string'],
                ], $rowNumber);

                $kendaraan = Kendaraan::query()->firstOrNew([
                    'nomor_polisi' => $payload['nomor_polisi'],
                ]);

                $isExisting = $kendaraan->exists;
                $kendaraan->fill($payload)->save();

                $result['total']++;
                $result[$isExisting ? 'updated' : 'created']++;
            }

            return $result;
        });
    }

    public function importTransaksiBbm(UploadedFile $file): array
    {
        return DB::transaction(function () use ($file) {
            $result = [
                'total' => 0,
                'created' => 0,
                'updated' => 0,
            ];

            foreach ($this->rows($file) as $rowNumber => $row) {
                $pegawaiId = $this->resolvePegawaiId($row, $rowNumber, true);
                $kendaraan = $this->resolveKendaraan($row, $rowNumber);
                $tanggal = $this->parseDate(
                    $this->requiredString($row, ['tanggal'], 'tanggal', $rowNumber),
                    $rowNumber,
                );

                $akunId = $this->resolveAkunPembayaranId(
                    $row,
                    $rowNumber,
                    (int) Carbon::parse($tanggal)->format('Y'),
                    $kendaraan->jenis_kendaraan,
                );

                $liter = $this->parseNumber(
                    $this->requiredString($row, ['liter'], 'liter', $rowNumber),
                    'liter',
                    $rowNumber,
                );
                $hargaPerLiter = $this->parseNumber(
                    $this->requiredString($row, ['harga_per_liter'], 'harga_per_liter', $rowNumber),
                    'harga_per_liter',
                    $rowNumber,
                );

                $payload = [
                    'tanggal' => $tanggal,
                    'pegawai_id' => $pegawaiId,
                    'kendaraan_id' => $kendaraan->id,
                    'akun_pembayaran_id' => $akunId,
                    'odometer' => $this->nullableDecimal($this->value($row, ['odometer'])),
                    'jenis_bbm' => $this->nullableString($this->value($row, ['jenis_bbm'])) ?: ($kendaraan->jenis_bbm_default ?: 'Pertalite'),
                    'liter' => $liter,
                    'harga_per_liter' => $hargaPerLiter,
                    'total' => $liter * $hargaPerLiter,
                    'spbu' => $this->nullableString($this->value($row, ['spbu', 'lokasi_spbu'])),
                    'nomor_nota' => $this->nullableString($this->value($row, ['nomor_nota', 'nota'])),
                    'catatan' => $this->nullableString($this->value($row, ['catatan'])),
                ];

                $this->validateRow($payload, [
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
                ], $rowNumber);

                $identity = [
                    'tanggal' => $payload['tanggal'],
                    'pegawai_id' => $payload['pegawai_id'],
                    'kendaraan_id' => $payload['kendaraan_id'],
                    'nomor_nota' => $payload['nomor_nota'],
                    'liter' => $payload['liter'],
                    'harga_per_liter' => $payload['harga_per_liter'],
                ];

                $transaksi = TransaksiBbm::query()->firstOrNew($identity);
                $isExisting = $transaksi->exists;
                $transaksi->fill($payload)->save();

                $result['total']++;
                $result[$isExisting ? 'updated' : 'created']++;
            }

            return $result;
        });
    }

    private function rows(UploadedFile $file): iterable
    {
        $handle = fopen($file->getRealPath(), 'rb');

        if (! $handle) {
            throw new RuntimeException('File CSV tidak dapat dibaca.');
        }

        try {
            $headers = null;
            $rowNumber = 1;

            while (($row = fgetcsv($handle)) !== false) {
                if ($headers === null) {
                    $headers = collect($row)
                        ->map(fn ($value) => $this->normalizeHeader((string) $value))
                        ->all();

                    continue;
                }

                $rowNumber++;

                if ($this->rowIsEmpty($row)) {
                    continue;
                }

                yield $rowNumber => collect($headers)
                    ->mapWithKeys(fn ($header, $index) => [$header => isset($row[$index]) ? trim((string) $row[$index]) : null])
                    ->all();
            }
        } finally {
            fclose($handle);
        }
    }

    private function normalizeHeader(string $header): string
    {
        return (string) Str::of($header)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/i', '_')
            ->trim('_');
    }

    private function rowIsEmpty(array $row): bool
    {
        return collect($row)->every(fn ($value) => blank(trim((string) $value)));
    }

    private function value(array $row, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $row) && filled($row[$key])) {
                return trim((string) $row[$key]);
            }
        }

        return null;
    }

    private function requiredString(array $row, array $keys, string $field, int $rowNumber): string
    {
        $value = $this->value($row, $keys);

        if (blank($value)) {
            throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: kolom {$field} wajib diisi.",
            ]);
        }

        return $value;
    }

    private function nullableString(?string $value): ?string
    {
        return filled($value) ? trim($value) : null;
    }

    private function nullableInteger(?string $value): ?int
    {
        if (blank($value)) {
            return null;
        }

        return (int) preg_replace('/[^0-9-]/', '', $value);
    }

    private function nullableDecimal(?string $value): ?float
    {
        if (blank($value)) {
            return null;
        }

        return $this->parseNumber($value, 'angka', 0);
    }

    private function parseNumber(string $value, string $field, int $rowNumber): float
    {
        $normalized = str_replace(['.', ','], ['', '.'], trim($value));

        if (! is_numeric($normalized)) {
            throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: kolom {$field} harus berupa angka.",
            ]);
        }

        return (float) $normalized;
    }

    private function parseDate(string $value, int $rowNumber): string
    {
        $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y', 'm/d/Y'];

        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, $value)->format('Y-m-d');
            } catch (\Throwable) {
            }
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: format tanggal {$value} tidak dikenali.",
            ]);
        }
    }

    private function normalizeJenisKendaraan(string $value, int $rowNumber): string
    {
        $normalized = Str::of($value)->lower()->replace([' ', '-'], '_')->value();

        return match ($normalized) {
            'roda2', 'roda_2', '2', 'r2' => 'roda_2',
            'roda4', 'roda_4', '4', 'r4' => 'roda_4',
            default => throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: jenis_kendaraan harus roda_2 atau roda_4.",
            ]),
        };
    }

    private function resolvePegawaiId(array $row, int $rowNumber, bool $required): ?int
    {
        if ($id = $this->value($row, ['pegawai_id'])) {
            $pegawai = Pegawai::query()->find($id);

            if ($pegawai) {
                return $pegawai->id;
            }
        }

        if ($nip = $this->value($row, ['pegawai_nip', 'nip'])) {
            $pegawai = Pegawai::query()->where('nip', $nip)->first();

            if ($pegawai) {
                return $pegawai->id;
            }
        }

        if ($nama = $this->value($row, ['pegawai_nama', 'nama_pegawai', 'pegawai'])) {
            $pegawai = Pegawai::query()->whereRaw('lower(nama) = ?', [Str::lower($nama)])->first();

            if ($pegawai) {
                return $pegawai->id;
            }
        }

        if ($required) {
            throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: pegawai tidak ditemukan. Gunakan pegawai_id, pegawai_nip, atau pegawai_nama.",
            ]);
        }

        return null;
    }

    private function resolveKendaraan(array $row, int $rowNumber): Kendaraan
    {
        if ($id = $this->value($row, ['kendaraan_id'])) {
            $kendaraan = Kendaraan::query()->find($id);

            if ($kendaraan) {
                return $kendaraan;
            }
        }

        if ($nomorPolisi = $this->value($row, ['nomor_polisi', 'nopol'])) {
            $kendaraan = Kendaraan::query()->whereRaw('lower(nomor_polisi) = ?', [Str::lower($nomorPolisi)])->first();

            if ($kendaraan) {
                return $kendaraan;
            }
        }

        if ($kode = $this->value($row, ['kode_kendaraan', 'kode_aset'])) {
            $kendaraan = Kendaraan::query()->whereRaw('lower(kode_kendaraan) = ?', [Str::lower($kode)])->first();

            if ($kendaraan) {
                return $kendaraan;
            }
        }

        throw ValidationException::withMessages([
            'file' => "Baris {$rowNumber}: kendaraan tidak ditemukan. Gunakan kendaraan_id, nomor_polisi, atau kode_kendaraan.",
        ]);
    }

    private function resolveAkunPembayaranId(array $row, int $rowNumber, int $tahun, string $jenisKendaraan): ?int
    {
        if ($id = $this->value($row, ['akun_pembayaran_id'])) {
            $akun = KelompokAkunPembayaran::query()->find($id);

            if ($akun) {
                return $akun->id;
            }
        }

        if ($kodeAkun = $this->value($row, ['kode_akun', 'kode_akun_pembayaran'])) {
            $akun = KelompokAkunPembayaran::query()
                ->where('kode_akun', $kodeAkun)
                ->where('tahun', $tahun)
                ->where('jenis_kendaraan', $jenisKendaraan)
                ->first();

            if ($akun) {
                return $akun->id;
            }
        }

        return KelompokAkunPembayaran::query()
            ->where('tahun', $tahun)
            ->where('jenis_kendaraan', $jenisKendaraan)
            ->value('id');
    }

    private function validateRow(array $payload, array $rules, int $rowNumber): void
    {
        $validator = Validator::make($payload, $rules);

        if ($validator->fails()) {
            $firstError = $validator->errors()->first();

            throw ValidationException::withMessages([
                'file' => "Baris {$rowNumber}: {$firstError}",
            ]);
        }
    }
}
