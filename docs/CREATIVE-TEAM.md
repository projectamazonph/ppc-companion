# PPC Companion — Creative Team

## Overview
A multi-agent AI crew that produces professional training materials for the Amazon PPC Manager Training Program.

## Team Structure

### 1. Creative Director
- **Role:** Brand steward & quality gate
- **Skills:** Brand consistency, visual hierarchy, pedagogical flow
- **Outputs:** Quality review, brand compliance check, final approval

### 2. Senior PPC Research Analyst
- **Role:** Data & insight provider
- **Skills:** Amazon advertising metrics, campaign analysis, industry benchmarks
- **Outputs:** Research JSON with case studies, benchmarks, glossary

### 3. Presentation Scriptwriter
- **Role:** Slide content & speaker notes
- **Skills:** Instructional design, narrative flow, VA audience adaptation
- **Outputs:** 10-12 slide scripts with speaker notes, visual concepts

### 4. Document Designer
- **Role:** PDF handout creation
- **Skills:** HTML/CSS layout, typography, print-ready formatting
- **Outputs:** PDF handouts via WeasyPrint with brand styling

### 5. Slide Producer
- **Role:** PPTX presentation builder
- **Skills:** Presentation design, visual hierarchy, slide master layouts
- **Outputs:** Professional PPTX with title, content, and closing slides

### 6. Infographic Designer
- **Role:** Visual summary creation
- **Skills:** Data visualization, icon design, layout composition
- **Outputs:** Single-page PNG infographics with callout stats

### 7. Spreadsheet Engineer
- **Role:** Excel workbook builder
- **Skills:** Formula design, conditional formatting, data validation
- **Outputs:** XLSX workbooks with calculators and trackers

## Brand Guidelines
- Primary: `#1a56db` (blue)
- Accent: `#f59e0b` (amber)
- Text: `#1f2937` (dark gray)
- Surface: `#ffffff` (white)
- Background: `#f8fafc` (light)

## Output Format
Every module generates 5 files:
| Format | Content | Tool |
|--------|---------|------|
| PPTX | Slide deck with speaker notes | python-pptx |
| PDF | Training handout with glossary | WeasyPrint |
| PNG | Single-page infographic | Pillow |
| XLSX | Calculator + data tracker | openpyxl |
| JSON | Raw structured content | crew output |

## Quality Standards
1. All metrics must be accurate (ACoS = ad spend / revenue)
2. Content must follow scaffolding: what -> why -> how -> practice
3. Designs must use brand colors consistently
4. Speaker notes must be 3-5 sentences per slide
5. Spreadsheet formulas must be valid Excel syntax
