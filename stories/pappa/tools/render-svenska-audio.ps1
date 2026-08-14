[CmdletBinding()]
param(
    [ValidateSet('chunks', 'preview', 'synth', 'concat', 'book')]
    [string]$Command = 'chunks',

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ReaderArgs
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$inputDir = Join-Path $repoRoot 'stories/pappa/chapters'
$outputDir = Join-Path $repoRoot 'dist/stories/pappa/audio/sv'
$reader = Join-Path $repoRoot 'tools/voice-renderer/reader.py'

$arguments = switch ($Command) {
    'chunks' {
        @($reader, 'chunks', '--language', 'sv', '--input', $inputDir)
    }
    'preview' {
        @($reader, 'synth', '--language', 'sv', '--input', $inputDir, '--out', $outputDir, '--also-wav', '--limit-chunks', '1')
    }
    'synth' {
        @($reader, 'synth', '--language', 'sv', '--input', $inputDir, '--out', $outputDir, '--also-wav')
    }
    'concat' {
        @($reader, 'concat', '--language', 'sv', '--input', $inputDir, '--out', $outputDir, '--wav', '--gap-ms', '450')
    }
    'book' {
        @($reader, 'book', '--out', $outputDir, '--wav', '--chapter-gap-ms', '1800', '--output-name', 'pappa-svenska')
    }
}

& python @arguments @ReaderArgs
exit $LASTEXITCODE
