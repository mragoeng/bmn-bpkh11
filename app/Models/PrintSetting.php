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
        'google_drive_folder_url',
        'template_content',
        'keterangan',
    ];
}
