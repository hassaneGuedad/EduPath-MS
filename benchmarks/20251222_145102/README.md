# EduPath Learning Analytics - Anonymized Dataset

## Overview

This dataset contains anonymized student learning profiles from the EduPath Learning Analytics platform.

## Dataset Information

- **Total Records**: 500 students
- **Features**: 11 attributes
- **Format**: CSV, JSON
- **License**: CC-BY-4.0
- **Version**: 1.0.0
- **Generated**: 2025-12-22 14:51:02

## Files

- student_profiles_anonymized.csv - Main dataset in CSV format
- student_profiles_anonymized.json - Main dataset in JSON format
- metadata.json - Complete dataset metadata
- README.md - This file
- CITATION.cff - Citation information
- LICENSE.txt - License text

## Schema

| Column | Type | Description | Range |
|--------|------|-------------|-------|
| anonymous_id | string | Hashed identifier | 16 chars |
| average_score | float | Average score | 0-100 |
| average_participation | float | Participation rate | 0-1 |
| total_time_spent | float | Hours on platform | 0+ |
| total_modules | integer | Modules accessed | 0+ |
| engagement_level | string | Engagement | Low/Medium/High |
| performance_trend | string | Trend | Declining/Stable/Improving |
| risk_score | float | Dropout risk | 0-100 |
| cohort | string | Academic year | YYYY-YYYY |
| institution_type | string | Institution | - |
| country | string | Country | Anonymous |

## Anonymization

This dataset follows privacy best practices:

- **K-anonymity**: k >= 5
- **Identifier Hashing**: SHA-256
- **Removed**: Names, emails, student IDs
- **Generalized**: Geographic and institutional data

## Usage Example (Python)

```python
import pandas as pd

# Load dataset
df = pd.read_csv('student_profiles_anonymized.csv')

# Basic statistics
print(df.describe())

# Engagement distribution
print(df['engagement_level'].value_counts())
```

## Citation

If you use this dataset, please cite:

```
EduPath Research Team. (2025). EduPath Learning Analytics Dataset.
Version 1.0.0. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX
```

## License

Creative Commons Attribution 4.0 International (CC-BY-4.0)

You are free to share and adapt this dataset with proper attribution.

## Reproducibility

- Random seed: 42
- Python: >=3.8
- Dependencies: pandas>=2.0.0, numpy>=1.24.0, scikit-learn>=1.3.0

---

Generated: 2025-12-22 14:51:02
