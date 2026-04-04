<?php

namespace Tests\Unit;

use App\Support\SpjPlaceholderBuilder;
use Tests\TestCase;

class SpjPlaceholderBuilderTest extends TestCase
{
    public function test_merge_template_replaces_html_placeholders_case_insensitively(): void
    {
        $merged = SpjPlaceholderBuilder::mergeTemplate(
            '<table><tr><td>{{Total}}</td><td>{{Terbilang}}</td></tr></table>',
            [
                '{{total}}' => 'Rp 180.000',
                '{{terbilang}}' => 'Seratus delapan puluh ribu rupiah',
            ],
        );

        $this->assertStringContainsString('Rp 180.000', $merged);
        $this->assertStringContainsString('Seratus delapan puluh ribu rupiah', $merged);
        $this->assertStringNotContainsString('{{Total}}', $merged);
        $this->assertStringNotContainsString('{{Terbilang}}', $merged);
    }

    public function test_merge_template_escapes_special_characters_for_html_templates(): void
    {
        $merged = SpjPlaceholderBuilder::mergeTemplate(
            '<p>{{catatan}}</p>',
            [
                '{{catatan}}' => 'ATK & BBM <uji>',
            ],
        );

        $this->assertStringContainsString('ATK &amp; BBM &lt;uji&gt;', $merged);
    }
}
