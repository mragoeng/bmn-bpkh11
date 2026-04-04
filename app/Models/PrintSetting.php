<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrintSetting extends Model
{
    use HasFactory;

    protected $table = 'print_settings';

    protected $fillable = [
        'nama_template',
        'google_docs_url',
        'template_content',
        'google_last_synced_at',
        'google_last_error',
        'keterangan',
    ];

    protected $casts = [
        'google_last_synced_at' => 'datetime',
    ];
}
