<?php

namespace App\Http\Controllers;

use App\Models\PeminjamanKendaraan;
use App\Models\Kendaraan;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PeminjamanKendaraanController extends Controller
{
    public function index(): Response
    {
        $search = request('search');
        $status = request('status');

        $peminjaman = PeminjamanKendaraan::query()
            ->with(['kendaraan:id,nama_barang,merk_tipe,nomor_polisi', 'pegawai:id,nip,nama,jabatan,unit'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('kendaraan', function ($kq) use ($search) {
                        $kq->where('nama_barang', 'like', "%{$search}%")
                            ->orWhere('nomor_polisi', 'like', "%{$search}%")
                            ->orWhere('merk_tipe', 'like', "%{$search}%");
                    })->orWhereHas('pegawai', function ($pq) use ($search) {
                        $pq->where('nama', 'like', "%{$search}%")
                            ->orWhere('nip', 'like', "%{$search}%");
                    })->orWhere('keperluan', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('tanggal_pinjam')
            ->latest()
            ->get();

        return Inertia::render('PeminjamanKendaraan/Index', [
            'peminjaman' => $peminjaman,
            'kendaraanOptions' => Kendaraan::query()
                ->orderBy('nama_barang')
                ->get(['id', 'kode_barang', 'nama_barang', 'merk_tipe', 'nomor_polisi']),
            'pegawaiOptions' => Pegawai::query()
                ->orderBy('nama')
                ->get(['id', 'nip', 'nama', 'jabatan', 'unit']),
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kendaraan_id' => 'required|exists:kendaraan,id',
            'pegawai_id' => 'required|exists:pegawai,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'keperluan' => 'required|string|max:500',
        ], [
            'kendaraan_id.required' => 'Kendaraan harus dipilih.',
            'pegawai_id.required' => 'Pegawai harus dipilih.',
            'tanggal_pinjam.required' => 'Tanggal pinjam harus diisi.',
            'tanggal_kembali.required' => 'Tanggal kembali harus diisi.',
            'tanggal_kembali.after_or_equal' => 'Tanggal kembali harus setelah tanggal pinjam.',
            'keperluan.required' => 'Keperluan harus diisi.',
        ]);

        $peminjaman = PeminjamanKendaraan::create($validated);
        $peminjaman->update(['nomor_surat' => $peminjaman->generateNomorSurat()]);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Peminjaman kendaraan berhasil dicatat. Menunggu persetujuan.');
    }

    public function update(Request $request, PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        $validated = $request->validate([
            'kendaraan_id' => 'sometimes|required|exists:kendaraan,id',
            'pegawai_id' => 'sometimes|required|exists:pegawai,id',
            'tanggal_pinjam' => 'sometimes|required|date',
            'tanggal_kembali' => 'sometimes|required|date|after_or_equal:tanggal_pinjam',
            'keperluan' => 'sometimes|required|string|max:500',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        $peminjaman_kendaraan->update($validated);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Data peminjaman berhasil diperbarui.');
    }

    public function approve(PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        if (!$peminjaman_kendaraan->isMenunggu()) {
            return back()->with('error', 'Hanya peminjaman dengan status MENUNGGU yang bisa disetujui.');
        }

        $peminjaman_kendaraan->update(['status' => 'DISETUJUI']);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Peminjaman kendaraan telah DISETUJUI.');
    }

    public function reject(Request $request, PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        if (!$peminjaman_kendaraan->isMenunggu()) {
            return back()->with('error', 'Hanya peminjaman dengan status MENUNGGU yang bisa ditolak.');
        }

        $validated = $request->validate([
            'keterangan' => 'required|string|max:1000',
        ], [
            'keterangan.required' => 'Alasan penolakan harus diisi.',
        ]);

        $peminjaman_kendaraan->update([
            'status' => 'DITOLAK',
            'keterangan' => $validated['keterangan'],
        ]);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Peminjaman kendaraan telah DITOLAK.');
    }

    public function returnKendaraan(PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        if (!$peminjaman_kendaraan->isDisetujui()) {
            return back()->with('error', 'Hanya peminjaman yang disetujui yang bisa dikembalikan.');
        }

        $peminjaman_kendaraan->update([
            'status' => 'DIKEMBALIKAN',
            'tanggal_kembali' => $peminjaman_kendaraan->tanggal_kembali ?? now(),
        ]);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Kendaraan telah dikembalikan.');
    }

    public function generatePdf(PeminjamanKendaraan $peminjaman_kendaraan)
    {
        $peminjaman_kendaraan->load(['kendaraan', 'pegawai']);

        $pdf = Pdf::loadView('pdf.peminjaman-kendaraan', [
            'peminjaman' => $peminjaman_kendaraan,
        ]);

        $pdf->setPaper('a4');

        return $pdf->stream('surat-peminjaman-kendaraan-' . $peminjaman_kendaraan->id . '.pdf');
    }

    public function uploadPdf(Request $request, PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        $validated = $request->validate([
            'bukti_pdf' => 'required|file|mimes:pdf|max:5120',
        ], [
            'bukti_pdf.required' => 'File PDF harus diupload.',
            'bukti_pdf.mimes' => 'File harus berformat PDF.',
            'bukti_pdf.max' => 'Ukuran file maksimal 5MB.',
        ]);

        if ($peminjaman_kendaraan->bukti_pdf_path) {
            Storage::disk('public')->delete($peminjaman_kendaraan->bukti_pdf_path);
        }

        $path = $request->file('bukti_pdf')->store('bukti-peminjaman-kendaraan', 'public');
        $peminjaman_kendaraan->update(['bukti_pdf_path' => $path]);

        return to_route('peminjaman-kendaraan.index')->with('success', 'Bukti PDF berhasil diupload.');
    }

    public function destroy(PeminjamanKendaraan $peminjaman_kendaraan): RedirectResponse
    {
        if ($peminjaman_kendaraan->bukti_pdf_path) {
            Storage::disk('public')->delete($peminjaman_kendaraan->bukti_pdf_path);
        }
        $peminjaman_kendaraan->delete();

        return to_route('peminjaman-kendaraan.index')->with('success', 'Data peminjaman berhasil dihapus.');
    }
}
