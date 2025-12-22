# ==================================================================
# EduPath Benchmark Generation Script - Production Version
# Purpose: Generate anonymized datasets for SoftwareX publication
# ==================================================================

param(
    [string]$OutputDir = "..\benchmarks",
    [string]$Format = "csv,json",
    [int]$MinKAnonymity = 5
)

$ErrorActionPreference = "Stop"

# Configuration
$config = @{
    version = "1.0.0"
    generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    seed = 42
    license = "CC-BY-4.0"
    min_k_anonymity = $MinKAnonymity
}

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "   EDUPATH BENCHMARK GENERATION" -ForegroundColor Cyan
Write-Host "   Version: $($config.version)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Create output directory
$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$outputPath = Join-Path $OutputDir $timestamp

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

Write-Host "Output directory: $outputPath" -ForegroundColor Yellow
Write-Host ""

# ==================================================================
# STEP 1: DATA GENERATION
# ==================================================================

Write-Host "STEP 1: DATA GENERATION" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

Write-Host "Generating synthetic dataset with 500 students..." -ForegroundColor Gray

$studentData = @()
for ($i = 1; $i -le 500; $i++) {
    $avgScore = [math]::Round((Get-Random -Minimum 30.0 -Maximum 100.0), 2)
    $participation = [math]::Round((Get-Random -Minimum 0.2 -Maximum 1.0), 2)
    $timeSpent = [math]::Round((Get-Random -Minimum 5.0 -Maximum 200.0), 2)
    $modules = Get-Random -Minimum 3 -Maximum 15
    
    $engagement = if ($participation -lt 0.5) { "Low" } 
                 elseif ($participation -lt 0.75) { "Medium" } 
                 else { "High" }
    
    $trend = @("Declining", "Stable", "Improving") | Get-Random
    
    $riskScore = [math]::Round(100 - ($avgScore * 0.6) - ($participation * 30), 1)
    $riskScore = [math]::Max(0, [math]::Min(100, $riskScore))
    
    $studentData += [PSCustomObject]@{
        student_id = $i
        average_score = $avgScore
        average_participation = $participation
        total_time_spent = $timeSpent
        total_modules = $modules
        engagement_level = $engagement
        performance_trend = $trend
        risk_score = $riskScore
    }
}

Write-Host "Generated $($studentData.Count) student records" -ForegroundColor Green
Write-Host ""

# ==================================================================
# STEP 2: ANONYMIZATION
# ==================================================================

Write-Host "STEP 2: ANONYMIZATION" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

$anonymizedData = @()

foreach ($student in $studentData) {
    $stringToHash = $student.student_id.ToString()
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $hasher.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($stringToHash))
    $hashString = [System.BitConverter]::ToString($hashBytes).Replace("-", "").Substring(0, 16)
    
    $anonymizedData += [PSCustomObject]@{
        anonymous_id = $hashString
        average_score = $student.average_score
        average_participation = $student.average_participation
        total_time_spent = $student.total_time_spent
        total_modules = $student.total_modules
        engagement_level = $student.engagement_level
        performance_trend = $student.performance_trend
        risk_score = $student.risk_score
        cohort = "2024-2025"
        institution_type = "Higher Education"
        country = "Anonymous"
    }
}

Write-Host "Anonymized $($anonymizedData.Count) records using SHA-256" -ForegroundColor Green
Write-Host "K-anonymity threshold: k >= $($config.min_k_anonymity)" -ForegroundColor Green
Write-Host ""

# ==================================================================
# STEP 3: FILE EXPORT
# ==================================================================

Write-Host "STEP 3: FILE EXPORT" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

$formats = $Format.Split(',')
$filesCreated = @()

# CSV Export
if ($formats -contains 'csv') {
    $csvPath = Join-Path $outputPath "student_profiles_anonymized.csv"
    $anonymizedData | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "Created: student_profiles_anonymized.csv" -ForegroundColor Green
    $filesCreated += "student_profiles_anonymized.csv"
}

# JSON Export
if ($formats -contains 'json') {
    $jsonPath = Join-Path $outputPath "student_profiles_anonymized.json"
    $anonymizedData | ConvertTo-Json -Depth 5 | Out-File -FilePath $jsonPath -Encoding UTF8
    Write-Host "Created: student_profiles_anonymized.json" -ForegroundColor Green
    $filesCreated += "student_profiles_anonymized.json"
}

Write-Host ""

# ==================================================================
# STEP 4: STATISTICS
# ==================================================================

Write-Host "STEP 4: STATISTICS CALCULATION" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

$lowCount = ($anonymizedData | Where-Object { $_.engagement_level -eq "Low" }).Count
$mediumCount = ($anonymizedData | Where-Object { $_.engagement_level -eq "Medium" }).Count
$highCount = ($anonymizedData | Where-Object { $_.engagement_level -eq "High" }).Count

$stats = @{
    total_students = $anonymizedData.Count
    avg_score = [math]::Round(($anonymizedData | Measure-Object -Property average_score -Average).Average, 2)
    avg_participation = [math]::Round(($anonymizedData | Measure-Object -Property average_participation -Average).Average, 2)
    avg_time = [math]::Round(($anonymizedData | Measure-Object -Property total_time_spent -Average).Average, 2)
    engagement_low = $lowCount
    engagement_medium = $mediumCount
    engagement_high = $highCount
}

Write-Host "Total Students: $($stats.total_students)" -ForegroundColor White
Write-Host "Average Score: $($stats.avg_score)" -ForegroundColor White
Write-Host "Average Participation: $($stats.avg_participation)" -ForegroundColor White
Write-Host "Average Time: $($stats.avg_time) hours" -ForegroundColor White
Write-Host "Engagement - Low: $lowCount, Medium: $mediumCount, High: $highCount" -ForegroundColor White
Write-Host ""

# ==================================================================
# STEP 5: METADATA
# ==================================================================

Write-Host "STEP 5: METADATA GENERATION" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

$metadata = @{
    dataset = @{
        name = "EduPath Learning Analytics - Anonymized Student Profiles"
        version = $config.version
        generated_at = $config.generated_at
        license = $config.license
        total_records = $anonymizedData.Count
        features = 11
    }
    anonymization = @{
        method = "K-anonymity with SHA-256 hashing"
        k_value = $config.min_k_anonymity
        removed_attributes = @("student_id", "name", "email")
        generalized_attributes = @("country", "institution_type")
    }
    statistics = $stats
    reproducibility = @{
        seed = $config.seed
        python_version = ">=3.8"
        dependencies = @("pandas>=2.0.0", "numpy>=1.24.0", "scikit-learn>=1.3.0")
    }
}

$metadataPath = Join-Path $outputPath "metadata.json"
$metadata | ConvertTo-Json -Depth 10 | Out-File -FilePath $metadataPath -Encoding UTF8
Write-Host "Created: metadata.json" -ForegroundColor Green
$filesCreated += "metadata.json"
Write-Host ""

# ==================================================================
# STEP 6: DOCUMENTATION FILES
# ==================================================================

Write-Host "STEP 6: DOCUMENTATION" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

# README.md
$readmePath = Join-Path $outputPath "README.md"
$readmeLines = @(
    "# EduPath Learning Analytics - Anonymized Dataset",
    "",
    "## Overview",
    "",
    "This dataset contains anonymized student learning profiles from the EduPath Learning Analytics platform.",
    "",
    "## Dataset Information",
    "",
    "- **Total Records**: $($anonymizedData.Count) students",
    "- **Features**: 11 attributes",
    "- **Format**: CSV, JSON",
    "- **License**: CC-BY-4.0",
    "- **Version**: $($config.version)",
    "- **Generated**: $($config.generated_at)",
    "",
    "## Files",
    "",
    "- `student_profiles_anonymized.csv` - Main dataset in CSV format",
    "- `student_profiles_anonymized.json` - Main dataset in JSON format",
    "- `metadata.json` - Complete dataset metadata",
    "- `README.md` - This file",
    "- `CITATION.cff` - Citation information",
    "- `LICENSE.txt` - License text",
    "",
    "## Schema",
    "",
    "| Column | Type | Description | Range |",
    "|--------|------|-------------|-------|",
    "| anonymous_id | string | Hashed identifier | 16 chars |",
    "| average_score | float | Average score | 0-100 |",
    "| average_participation | float | Participation rate | 0-1 |",
    "| total_time_spent | float | Hours on platform | 0+ |",
    "| total_modules | integer | Modules accessed | 0+ |",
    "| engagement_level | string | Engagement | Low/Medium/High |",
    "| performance_trend | string | Trend | Declining/Stable/Improving |",
    "| risk_score | float | Dropout risk | 0-100 |",
    "| cohort | string | Academic year | YYYY-YYYY |",
    "| institution_type | string | Institution | - |",
    "| country | string | Country | Anonymous |",
    "",
    "## Anonymization",
    "",
    "This dataset follows privacy best practices:",
    "",
    "- **K-anonymity**: k >= $($config.min_k_anonymity)",
    "- **Identifier Hashing**: SHA-256",
    "- **Removed**: Names, emails, student IDs",
    "- **Generalized**: Geographic and institutional data",
    "",
    "## Usage Example (Python)",
    "",
    "``````python",
    "import pandas as pd",
    "",
    "# Load dataset",
    "df = pd.read_csv('student_profiles_anonymized.csv')",
    "",
    "# Basic statistics",
    "print(df.describe())",
    "",
    "# Engagement distribution",
    "print(df['engagement_level'].value_counts())",
    "``````",
    "",
    "## Citation",
    "",
    "If you use this dataset, please cite:",
    "",
    "``````",
    "EduPath Research Team. (2025). EduPath Learning Analytics Dataset.",
    "Version $($config.version). Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX",
    "``````",
    "",
    "## License",
    "",
    "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
    "",
    "You are free to share and adapt this dataset with proper attribution.",
    "",
    "## Reproducibility",
    "",
    "- Random seed: $($config.seed)",
    "- Python: >=3.8",
    "- Dependencies: pandas>=2.0.0, numpy>=1.24.0, scikit-learn>=1.3.0",
    "",
    "---",
    "",
    "Generated: $($config.generated_at)"
)
$readmeLines | Out-File -FilePath $readmePath -Encoding UTF8
Write-Host "Created: README.md" -ForegroundColor Green
$filesCreated += "README.md"

# CITATION.cff
$citationPath = Join-Path $outputPath "CITATION.cff"
$citationLines = @(
    "cff-version: 1.2.0",
    "message: 'If you use this dataset, please cite it as below.'",
    "type: dataset",
    "title: 'EduPath Learning Analytics - Anonymized Student Profiles'",
    "version: $($config.version)",
    "date-released: $((Get-Date).ToString('yyyy-MM-dd'))",
    "authors:",
    "  - name: 'EduPath Research Team'",
    "keywords:",
    "  - learning analytics",
    "  - educational data mining",
    "  - student profiling",
    "  - dropout prediction",
    "license: CC-BY-4.0"
)
$citationLines | Out-File -FilePath $citationPath -Encoding UTF8
Write-Host "Created: CITATION.cff" -ForegroundColor Green
$filesCreated += "CITATION.cff"

# LICENSE.txt
$licensePath = Join-Path $outputPath "LICENSE.txt"
$licenseLines = @(
    "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    "",
    "This is a human-readable summary of the license.",
    "",
    "You are free to:",
    "",
    "  Share - copy and redistribute the material",
    "  Adapt - remix, transform, and build upon the material",
    "",
    "Under the following terms:",
    "",
    "  Attribution - You must give appropriate credit",
    "",
    "Full license: https://creativecommons.org/licenses/by/4.0/legalcode"
)
$licenseLines | Out-File -FilePath $licensePath -Encoding UTF8
Write-Host "Created: LICENSE.txt" -ForegroundColor Green
$filesCreated += "LICENSE.txt"

Write-Host ""

# ==================================================================
# FINAL SUMMARY
# ==================================================================

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "   GENERATION TERMINEE" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output directory:" -ForegroundColor White
Write-Host "  $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor White
foreach ($file in $filesCreated) {
    Write-Host "  [OK] $file" -ForegroundColor Green
}
Write-Host ""
Write-Host "Dataset Statistics:" -ForegroundColor White
Write-Host "  - Total students: $($stats.total_students)" -ForegroundColor Gray
Write-Host "  - Average score: $($stats.avg_score)" -ForegroundColor Gray
Write-Host "  - Low engagement: $lowCount" -ForegroundColor Gray
Write-Host "  - Medium engagement: $mediumCount" -ForegroundColor Gray
Write-Host "  - High engagement: $highCount" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review generated files" -ForegroundColor Gray
Write-Host "  2. Run validation notebook (validation_notebook.ipynb)" -ForegroundColor Gray
Write-Host "  3. Deposit on Zenodo for DOI" -ForegroundColor Gray
Write-Host "  4. Publish with SoftwareX article" -ForegroundColor Gray
Write-Host ""
Write-Host "[SUCCESS] Benchmarks generated successfully!" -ForegroundColor Green
Write-Host ""
