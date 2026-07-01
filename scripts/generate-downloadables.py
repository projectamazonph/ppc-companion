#!/usr/bin/env python3
"""
Generate all downloadable resource files for the Amazon PPC Training Program.
Outputs to /home/z/my-project/public/downloads/
"""

import csv
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT_DIR = "/home/z/my-project/public/downloads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# 1. KEYWORD RESEARCH TEMPLATE (CSV)
# ============================================================

def create_keyword_research_csv():
    filepath = os.path.join(OUTPUT_DIR, "keyword-research-template.csv")
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['#', 'Keyword', 'Tier (1/2/3)', 'Est. Monthly Volume', 'Match Type', 'Campaign Layer', 'Notes'])
        # Sample rows
        samples = [
            [1, 'insulated water bottle', '1', '12000', 'Exact', 'Heroes', 'High volume, high intent — hero keyword'],
            [2, 'stainless steel water bottle', '1', '9500', 'Exact', 'Heroes', 'Core product description'],
            [3, 'water bottle 32oz', '1', '7200', 'Exact', 'Heroes', 'Size-specific — high purchase intent'],
            [4, 'water bottle', '1', '85000', 'Broad', 'Discovery', 'Too broad for Exact, use in Broad'],
            [5, 'gym water bottle', '2', '3100', 'Phrase', 'Expansion', 'Use-case specific'],
            [6, 'water bottle for hiking', '2', '2400', 'Phrase', 'Expansion', 'Outdoor use case'],
            [7, 'water bottle with straw', '2', '1800', 'Phrase', 'Expansion', 'Feature-specific'],
            [8, 'water bottle for office desk', '2', '900', 'Phrase', 'Expansion', 'Long-tail, lower competition'],
            [9, 'hydroflask alternative', '3', '600', 'ASIN', 'Defense', 'Competitor brand targeting'],
            [10, 'yeti water bottle dupe', '3', '400', 'ASIN', 'Defense', 'Competitor brand targeting'],
            [11, '', '', '', '', '', ''],
            [12, '', '', '', '', '', ''],
            [13, '', '', '', '', '', ''],
        ]
        writer.writerows(samples)
    print(f"  ✓ {filepath}")

# ============================================================
# 2. CAMPAIGN BLUEPRINT TEMPLATE (CSV)
# ============================================================

def create_campaign_blueprint_csv():
    filepath = os.path.join(OUTPUT_DIR, "campaign-blueprint-template.csv")
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Campaign Name', 'Ad Type', 'Match Type', 'Daily Budget ($)', 'Goal', 'Example Keywords/Targets', 'Bid Strategy'])
        # Sample rows
        samples = [
            ['Product – SP – Auto – Discovery', 'Sponsored Products', 'Auto', '15', 'Find new search terms', '(Amazon decides)', 'Down Only'],
            ['Product – SP – Broad – Discovery', 'Sponsored Products', 'Broad', '10', 'Explore variations', 'keyword1, keyword2', 'Down Only'],
            ['Product – SP – Phrase – Expansion', 'Sponsored Products', 'Phrase', '12', 'Scale promising terms', 'keyword3, keyword4', 'Down Only'],
            ['Product – SP – Exact – Heroes', 'Sponsored Products', 'Exact', '25', 'Maximize profit on heroes', 'keyword5, keyword6', 'Up and Down'],
            ['Product – SD – ASIN – Conquest', 'Sponsored Display', 'ASIN', '8', 'Win competitor shoppers', 'B08XXX, B09XXX', 'Down Only'],
            ['Product – SD – Retarget', 'Sponsored Display', 'Retargeting', '5', 'Reclaim viewers', '(Viewers who did not buy)', 'Down Only'],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
        ]
        writer.writerows(samples)
    print(f"  ✓ {filepath}")

# ============================================================
# 3. SEARCH TERM REPORT TEMPLATE (CSV)
# ============================================================

def create_search_term_report_csv():
    filepath = os.path.join(OUTPUT_DIR, "search-term-report-template.csv")
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Search Term', 'Clicks', 'Spend ($)', 'Orders', 'Sales ($)', 'ACoS (%)', 'Action', 'Bid Change (%)', 'Reason'])
        # Sample data from Exercise 3.3A
        samples = [
            ['insulated water bottle', 45, 67.50, 8, 240, 28, '', '', ''],
            ['cheap water bottle', 32, 28.80, 0, 0, '', '', '', ''],
            ['water bottle 32oz', 28, 42.00, 5, 150, 28, '', '', ''],
            ['glass water bottle', 18, 27.00, 0, 0, '', '', '', ''],
            ['hiking water bottle with filter', 12, 18.00, 3, 90, 20, '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
        ]
        writer.writerows(samples)
    print(f"  ✓ {filepath}")

# ============================================================
# 4. WEEKLY REPORT TEMPLATE (PDF)
# ============================================================

def create_weekly_report_pdf():
    filepath = os.path.join(OUTPUT_DIR, "weekly-report-template.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("Weekly PPC Report Template", styles['Title']))
    story.append(Paragraph("Amazon PPC Manager Training Program", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Instructions
    story.append(Paragraph("<b>How to use this template:</b> Fill in each section with your campaign data. Keep it under 1 page. Use numbers, not adjectives. Always compare to last week.", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))

    # Fields
    fields = [
        ("Product:", "_______________________________"),
        ("Week of:", "_______________________________"),
        ("Prepared by:", "_______________________________"),
    ]
    for label, value in fields:
        story.append(Paragraph(f"<b>{label}</b> {value}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Summary", styles['Heading2']))
    story.append(Paragraph("Fill in the top 4-5 bullets. This is all some clients will read.", styles['Italic']))
    summary_data = [
        ['Metric', 'This Week', 'Last Week', 'Change'],
        ['Ad Spend', '$_______', '$_______', '____%'],
        ['Ad Sales', '$_______', '$_______', '____%'],
        ['ACoS', '____%', '____%', '____pp'],
        ['TACoS', '____%', '____%', '____pp'],
        ['Total Revenue', '$_______', '$_______', '____%'],
    ]
    t = Table(summary_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3*inch))

    # Section 2: Wins
    story.append(Paragraph("2. Wins (What went well)", styles['Heading2']))
    story.append(Paragraph("List 2-3 specific positive developments with numbers.", styles['Italic']))
    for i in range(3):
        story.append(Paragraph(f"• ______________________________________________________________________________________________________", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))

    # Section 3: Issues
    story.append(Paragraph("3. Issues (What needs fixing)", styles['Heading2']))
    story.append(Paragraph("List 2-3 problems you identified and what you did about them.", styles['Italic']))
    for i in range(3):
        story.append(Paragraph(f"• ______________________________________________________________________________________________________", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))

    # Section 4: Actions Taken
    story.append(Paragraph("4. Actions Taken", styles['Heading2']))
    story.append(Paragraph("Specific changes you made this week.", styles['Italic']))
    actions_data = [
        ['Action', 'Target', 'Reason'],
        ['Bid change', '_____________', '_______________________'],
        ['Negative added', '_____________', '_______________________'],
        ['Keyword promoted', '_____________', '_______________________'],
        ['Budget change', '_____________', '_______________________'],
        ['Other', '_____________', '_______________________'],
    ]
    t = Table(actions_data, colWidths=[1.5*inch, 2*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3*inch))

    # Section 5: Next Steps
    story.append(Paragraph("5. Next Steps & Requests", styles['Heading2']))
    story.append(Paragraph("What you plan to test next week. Any asks from the client.", styles['Italic']))
    for i in range(3):
        story.append(Paragraph(f"• ______________________________________________________________________________________________________", styles['Normal']))

    doc.build(story)
    print(f"  ✓ {filepath}")

# ============================================================
# 5. CAPSTONE PROJECT TEMPLATE (PDF)
# ============================================================

def create_capstone_template_pdf():
    filepath = os.path.join(OUTPUT_DIR, "capstone-project-template.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Capstone Project Template", styles['Title']))
    story.append(Paragraph("Amazon PPC Manager Training Program", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))

    # Product brief
    story.append(Paragraph("Product Brief", styles['Heading2']))
    brief_fields = [
        ("Product:", "_________________________________________"),
        ("Price:", "$__________"),
        ("Competition:", "Low / Medium / High"),
        ("Target ACoS:", "________%"),
        ("Target TACoS:", "________%"),
    ]
    for label, value in brief_fields:
        story.append(Paragraph(f"<b>{label}</b> {value}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Deliverable 1
    story.append(Paragraph("Deliverable 1: Keyword Research File", styles['Heading2']))
    story.append(Paragraph("50-100 keywords organized into Tier 1, Tier 2, Tier 3. Use the keyword-research-template.csv file.", styles['Italic']))
    story.append(Paragraph("Brief explanation of your tiering choices:", styles['Normal']))
    for i in range(5):
        story.append(Paragraph(f"• __________________________________________________________________________________________", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Deliverable 2
    story.append(Paragraph("Deliverable 2: Campaign Blueprint", styles['Heading2']))
    story.append(Paragraph("Use the campaign-blueprint-template.csv file. Include all 4 layers: Discovery, Expansion, Heroes, Defense.", styles['Italic']))
    story.append(Paragraph("Naming convention: [Product] - [Ad Type] - [Match Type] - [Purpose]", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Deliverable 3
    story.append(Paragraph("Deliverable 3: 30-Day Launch Plan", styles['Heading2']))
    plan_data = [
        ['Week', 'Phase', 'Key Tasks', 'Budget Split', 'Target ACoS'],
        ['Week 1', 'Launch', '___________________________', '_____________', '______%'],
        ['Week 2', 'Launch', '___________________________', '_____________', '______%'],
        ['Week 3', 'Transition', '___________________________', '_____________', '______%'],
        ['Week 4', 'Scale', '___________________________', '_____________', '______%'],
    ]
    t = Table(plan_data, colWidths=[0.8*inch, 1*inch, 2.5*inch, 1.5*inch, 1*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3*inch))

    # Deliverable 4
    story.append(Paragraph("Deliverable 4: Optimization Report", styles['Heading2']))
    story.append(Paragraph("Using dummy data from Module 3.3, write a weekly report (use the weekly-report-template.pdf).", styles['Italic']))
    story.append(Paragraph("<b>What worked:</b>", styles['Normal']))
    for i in range(3):
        story.append(Paragraph(f"• __________________________________________________________________________________________", styles['Normal']))
    story.append(Paragraph("<b>What didn't:</b>", styles['Normal']))
    for i in range(3):
        story.append(Paragraph(f"• __________________________________________________________________________________________", styles['Normal']))
    story.append(Paragraph("<b>Recommended changes:</b>", styles['Normal']))
    for i in range(3):
        story.append(Paragraph(f"• __________________________________________________________________________________________", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    # Deliverable 5
    story.append(Paragraph("Deliverable 5: Presentation (5-10 minutes)", styles['Heading2']))
    story.append(Paragraph("Present your strategy as if your instructor is the client. Practice with a timer.", styles['Italic']))
    pres_data = [
        ['Section', 'Time', 'Key Points'],
        ['1. Executive Summary', '1 min', 'Headline: target sales, ACoS, TACoS'],
        ['2. Campaign Blueprint', '2 min', 'Show the 4-layer structure visually'],
        ['3. Wins & Issues', '2 min', '2 wins, 1 issue with fix'],
        ['4. Optimization Report', '2 min', 'Key data + what you changed'],
        ['5. Next 30-Day Plan', '2 min', 'What you would do in month 2'],
        ['Q&A', '1 min', 'Be ready for questions'],
    ]
    t = Table(pres_data, colWidths=[2*inch, 0.8*inch, 3.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)

    doc.build(story)
    print(f"  ✓ {filepath}")

# ============================================================
# 6. PPC CHEAT SHEET (PDF) — one-page reference
# ============================================================

def create_cheat_sheet_pdf():
    filepath = os.path.join(OUTPUT_DIR, "ppc-cheat-sheet.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=landscape(letter),
                            rightMargin=0.5*inch, leftMargin=0.5*inch,
                            topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Amazon PPC Cheat Sheet", styles['Title']))
    story.append(Spacer(1, 0.15*inch))

    # Two-column layout using a table
    # Left column: Formulas + Optimization Rules
    # Right column: Match Types + Naming + Bid Strategy

    # Formulas
    formula_style = ParagraphStyle('Formula', parent=styles['Normal'], fontSize=8, leading=11)
    heading_style = ParagraphStyle('MiniHeading', parent=styles['Heading3'], fontSize=10, textColor=colors.HexColor('#d97706'))

    left_col = []
    left_col.append(Paragraph("Metric Formulas", heading_style))
    formulas = [
        "CTR = (Clicks / Impressions) x 100  |  Healthy: 0.25-0.50%+",
        "CPC = Spend / Clicks  |  Healthy: $0.50-$2.50",
        "CVR = (Orders / Clicks) x 100  |  Healthy: 5-15%+",
        "ACoS = (Spend / Ad Sales) x 100  |  Target: 10-35%",
        "ROAS = Ad Sales / Spend  |  Healthy: 3.0-10.0+",
        "TACoS = (Spend / Total Revenue) x 100  |  Healthy: 5-15%",
    ]
    for f in formulas:
        left_col.append(Paragraph(f, formula_style))

    left_col.append(Spacer(1, 0.15*inch))
    left_col.append(Paragraph("Optimization Rules", heading_style))
    rules = [
        "10-15+ clicks, 0 orders -> NEGATIVE keyword",
        "3+ orders, ACoS <= target -> PROMOTE to Exact",
        "ACoS well below target -> INCREASE bid 10-20%",
        "ACoS above target, 10+ clicks -> DECREASE bid 10-20%",
        "Never change bids by more than 20% at once",
        "Review search term report every 3-7 days",
        "Always document changes: date, term, action, reason",
    ]
    for r in rules:
        left_col.append(Paragraph(f"• {r}", formula_style))

    left_col.append(Spacer(1, 0.15*inch))
    left_col.append(Paragraph("Campaign Structure (4 Layers)", heading_style))
    layers = [
        "1. Discovery (Auto+Broad) - ~30% budget - find new terms",
        "2. Expansion (Phrase) - ~20% budget - scale promising terms",
        "3. Heroes (Exact) - ~40% budget - max profit on best keywords",
        "4. Defense & Conquest (ASIN+SD) - ~10% budget - defend/attack",
    ]
    for l in layers:
        left_col.append(Paragraph(l, formula_style))

    # Right column
    right_col = []
    right_col.append(Paragraph("Match Types", heading_style))
    match_types = [
        "Auto: Amazon decides based on listing. Widest reach.",
        "Broad: Variations & synonyms. Word order doesn't matter.",
        "Phrase: Must include keyword in order. Words can be added.",
        "Exact: Only that keyword + close variants. Tightest control.",
    ]
    for m in match_types:
        right_col.append(Paragraph(f"• {m}", formula_style))

    right_col.append(Spacer(1, 0.15*inch))
    right_col.append(Paragraph("Bid Strategies", heading_style))
    bids = [
        "Dynamic Down Only: AI can lower bids. For new/untested keywords.",
        "Dynamic Up & Down: AI can raise+lower. For proven keywords.",
        "Fixed Bids: No AI changes. Rare in 2026.",
        "Placement Multiplier: +X% for top of search or product pages.",
    ]
    for b in bids:
        right_col.append(Paragraph(f"• {b}", formula_style))

    right_col.append(Spacer(1, 0.15*inch))
    right_col.append(Paragraph("Naming Convention", heading_style))
    right_col.append(Paragraph("[Product] - [Ad Type] - [Match Type] - [Purpose]", formula_style))
    right_col.append(Paragraph("Examples:", formula_style))
    examples = [
        "WaterBottle - SP - Auto - Discovery",
        "WaterBottle - SP - Exact - Heroes",
        "WaterBottle - SB - Video - Brand",
        "WaterBottle - SD - ASIN - Conquest",
    ]
    for e in examples:
        right_col.append(Paragraph(f"  {e}", formula_style))

    right_col.append(Spacer(1, 0.15*inch))
    right_col.append(Paragraph("Common Negative Keywords", heading_style))
    negatives = "free, cheap, used, broken, parts, repair, how to, DIY, replacement, wholesale, used"
    right_col.append(Paragraph(negatives, formula_style))

    right_col.append(Spacer(1, 0.15*inch))
    right_col.append(Paragraph("Launch vs Scale", heading_style))
    launch_scale = [
        "Launch (Days 1-30): ACoS 30-50% OK. More Discovery budget.",
        "Scale (Day 30+): ACoS 15-25%. Shift to Heroes. Tighten negatives.",
        "Watch TACoS trend: falling TACoS = healthy scaling.",
    ]
    for ls in launch_scale:
        right_col.append(Paragraph(f"• {ls}", formula_style))

    # Build two-column table
    two_col = Table([[left_col, right_col]], colWidths=[5*inch, 5*inch])
    two_col.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#fffbeb')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#fef3c7')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#f59e0b')),
        ('LINEAFTER', (0, 0), (0, 0), 1, colors.HexColor('#f59e0b')),
    ]))
    story.append(two_col)

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Amazon PPC Manager Training Program v2026 | Keep this sheet handy during weekly optimization sessions.", 
                           ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, textColor=colors.grey, alignment=TA_CENTER)))

    doc.build(story)
    print(f"  ✓ {filepath}")

# ============================================================
# 7. GLOSSARY (PDF)
# ============================================================

def create_glossary_pdf():
    filepath = os.path.join(OUTPUT_DIR, "glossary.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Amazon PPC Glossary", styles['Title']))
    story.append(Paragraph("Amazon PPC Manager Training Program v2026", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))

    glossary_data = {
        "Fundamentals": [
            ("ASIN", "Amazon Standard Identification Number; unique ID for each product. Ads always point to an ASIN."),
            ("SKU", "Internal stock ID used by the seller; visible in reports but ads still connect to ASINs."),
            ("Buy Box", 'The main "Add to Cart" / "Buy Now" area on a product page. Required for Sponsored Products to show and convert well.'),
            ("FBA", "Fulfilled by Amazon - Amazon stores and ships the product. Usually better delivery and higher conversion."),
            ("FBM", "Fulfilled by Merchant - the seller ships themselves. Can be slower and convert worse."),
            ("Brand Registry", "Amazon's program that gives brand owners enhanced tools. Required for Sponsored Brands and SB Video."),
            ("BSR", "Best Sellers Rank - Amazon's hourly ranking of how well a product sells in its category. Higher ad sales lift BSR."),
            ("A9 Algorithm", "Amazon's search ranking algorithm. Weighs sales velocity, relevance, price, and availability."),
        ],
        "Ad Types": [
            ("Sponsored Products (SP)", "Single-product ads that show in search results and on product pages. Main performance driver."),
            ("Sponsored Brands (SB)", "Banner ads at the top of search results showing logo, headline, and multiple products. Requires Brand Registry."),
            ("Sponsored Brands Video (SBV)", "15-30 second video placements. Product shown in first 1-3 seconds. Requires Brand Registry."),
            ("Sponsored Display (SD)", "Ads for retargeting viewers and showing on competitor product pages. Good for conquesting."),
            ("Sponsored TV", "Upper-funnel video ads on Fire TV / Prime Video. Mostly for larger brands with bigger budgets."),
        ],
        "Metrics": [
            ("Impressions", "How many times your ad was shown."),
            ("Clicks", "How many times people clicked your ad."),
            ("CTR", "Click-Through Rate = Clicks / Impressions x 100. Measures ad attractiveness/relevance."),
            ("CPC", "Cost Per Click = Ad Spend / Clicks. Average cost of each click."),
            ("CVR", "Conversion Rate = Orders / Clicks x 100. How good the listing is at turning clicks into orders."),
            ("ACoS", "Advertising Cost of Sales = Ad Spend / Ad Sales x 100. Lower is more efficient."),
            ("ROAS", "Return on Ad Spend = Ad Sales / Ad Spend. Higher is better."),
            ("TACoS", "Total ACoS = Ad Spend / Total Revenue x 100. Shows ad impact on entire business."),
        ],
        "Strategy": [
            ("Auto Match", "Amazon decides where to show your ads based on your listing. Great for discovery."),
            ("Broad Match", "Shows for variations, synonyms, and related searches. Good for exploring."),
            ("Phrase Match", "Search must include your keyword phrase in the same order, words can be added."),
            ("Exact Match", "Only triggers for that exact keyword or very close variations. Best for hero keywords."),
            ("Negative Keyword", "A keyword you tell Amazon NOT to trigger your ad for. Stops wasted spend."),
            ("ASIN Targeting", "Targeting specific competitor or complementary ASINs. Use when your offer is stronger."),
            ("Dynamic Down Only", "Bid strategy where Amazon can only lower bids. Best for untested keywords."),
            ("Dynamic Up & Down", "Bid strategy where Amazon can raise and lower bids. For proven keywords."),
            ("Placement Multiplier", "Adjusts bids for specific placements (e.g. more aggressive at top of search)."),
            ("Harvesting", "Finding converting search terms in Auto/Broad reports and moving them to Phrase/Exact."),
            ("Conquesting", "Placing your ads on competitor product pages to win their shoppers."),
            ("Hero Keyword", "A proven, profitable keyword placed in Exact match Hero campaigns for maximum control."),
        ],
    }

    for category, terms in glossary_data.items():
        story.append(Paragraph(category, styles['Heading2']))
        story.append(Spacer(1, 0.1*inch))

        table_data = [['Term', 'Definition']]
        for term, definition in terms:
            table_data.append([term, definition])

        t = Table(table_data, colWidths=[2*inch, 4.5*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.25*inch))

    doc.build(story)
    print(f"  ✓ {filepath}")

# ============================================================
# RUN ALL
# ============================================================

print("Generating downloadables...")
create_keyword_research_csv()
create_campaign_blueprint_csv()
create_search_term_report_csv()
create_weekly_report_pdf()
create_capstone_template_pdf()
create_cheat_sheet_pdf()
create_glossary_pdf()
print("\n✅ All downloadables generated in", OUTPUT_DIR)
