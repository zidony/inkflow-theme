import glob
import re

html_files = glob.glob('src/**/*.html', recursive=True)

# Replacements map for simple utility extractions
replacements = [
    # Z-Index
    ('class="container position-relative" style="z-index:1"', 'class="container position-relative z-1"'),
    ('style="z-index:1"', 'class="z-1"'), # Fallback
    
    # Colors into existing classes if possible
    ('class="bi bi-heart-fill" style="color:var(--ink-accent)"', 'class="bi bi-heart-fill u-text-accent"'),
    ('class="bi bi-calendar3 me-2" style="color:var(--ink-primary)"', 'class="bi bi-calendar3 me-2 u-text-primary"'),
    ('class="bi bi-fire" style="color:var(--ink-accent)"', 'class="bi bi-fire u-text-accent"'),
    ('class="bi bi-star-fill"></i>推荐', 'class="bi bi-star-fill"></i>推荐'), # Fix potential broken ones
    ('class="bi bi-cpu" style="color:var(--ink-primary)"', 'class="bi bi-cpu u-text-primary"'),
    ('class="bi bi-palette2" style="color:#7c3aed"', 'class="bi bi-palette2 u-text-purple"'),
    ('class="bi bi-rocket-takeoff" style="color:#d97706"', 'class="bi bi-rocket-takeoff u-text-orange"'),
    ('class="bi bi-robot" style="color:#0891b2"', 'class="bi bi-robot u-text-cyan"'),
    ('class="bi bi-feather" style="color:#c026d3"', 'class="bi bi-feather u-text-pink"'),
    
    # Archive List specific components
    ('style="font-family:var(--font-display);font-weight:700;font-size:1rem;color:var(--ink-heading)"', 'class="archive-stat-header"'),
    ('style="display:flex;align-items:center;gap:.4rem;font-size:.75rem;color:var(--ink-muted)"', 'class="archive-stat-heat-row"'),
    ('style="width:11px;height:11px;border-radius:2px;background:var(--ink-border)"', 'class="archive-stat-heat-dot" style="background:var(--ink-border)"'),
    ('style="width:11px;height:11px;border-radius:2px;background:rgba(var(--ink-primary-rgb),.2)"', 'class="archive-stat-heat-dot" style="background:rgba(var(--ink-primary-rgb),.2)"'),
    ('style="width:11px;height:11px;border-radius:2px;background:rgba(var(--ink-primary-rgb),.5)"', 'class="archive-stat-heat-dot" style="background:rgba(var(--ink-primary-rgb),.5)"'),
    ('style="width:11px;height:11px;border-radius:2px;background:var(--ink-primary)"', 'class="archive-stat-heat-dot" style="background:var(--ink-primary)"'),
    ('style="margin-top:.75rem;font-size:.78rem;color:var(--ink-muted)"', 'class="mt-3" style="font-size:.78rem;color:var(--ink-muted)"'),
    ('style="color:var(--ink-primary)"', 'class="u-text-primary"'),
    ('style="margin-left:auto;font-size:.82rem;color:var(--ink-muted);align-self:center"', 'class="ms-auto align-self-center" style="font-size:.82rem;color:var(--ink-muted)"'),
    ('style="color:var(--ink-heading)"', 'class="u-text-heading"'),
    ('class="d-flex justify-content-between align-items-center py-1" style="border-bottom:1px solid var(--ink-border)"', 'class="archive-stat-list-item"'),
    ('style="display:flex;align-items:center;gap:.5rem;font-size:.88rem;color:var(--ink-heading)"', 'class="archive-stat-label"'),
    ('style="font-family:var(--font-mono);font-size:.82rem;font-weight:600;color:var(--ink-primary)"', 'class="archive-stat-value u-text-primary"'),
    ('style="font-family:var(--font-mono);font-size:.82rem;font-weight:600;color:#7c3aed"', 'class="archive-stat-value u-text-purple"'),
    ('style="font-family:var(--font-mono);font-size:.82rem;font-weight:600;color:#d97706"', 'class="archive-stat-value u-text-orange"'),
    ('style="font-family:var(--font-mono);font-size:.82rem;font-weight:600;color:#0891b2"', 'class="archive-stat-value u-text-cyan"'),
    ('style="font-family:var(--font-mono);font-size:.82rem;font-weight:600;color:#c026d3"', 'class="archive-stat-value u-text-pink"'),
]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    # Some targeted regex for the big album icons
    content = re.sub(r'class="bi bi-image" style="font-size:5rem;color:rgba\(255,255,255,\.15\)"', r'class="bi bi-image" style="font-size:5rem;color:rgba(255,255,255,.15)"', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Inline styles extracted and HTML refactored.')
