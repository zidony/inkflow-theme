import glob
import re

html_files = glob.glob('src/**/*.html', recursive=True)

# Order matters! We must replace longer classes first so prefixes don't break.
replacements = [
    # Fix the broken btn-auth-social in login.html
    (r'\bink-btn ink-btn-soft w-100-social\b', 'ink-btn ink-btn-white w-100'),
    
    # Fix the ones missed by the buggy script
    (r'\bbtn-profile-save\s+btn-sm-profile\b', 'ink-btn ink-btn-soft ink-btn-sm'),
    (r'\bbtn-profile-save\b', 'ink-btn ink-btn-soft'),
    (r'\bbtn-submit\b', 'ink-btn ink-btn-soft'),
    (r'\bbtn-comment\b', 'ink-btn ink-btn-soft'),
]

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    for pattern, new_class in replacements:
        content = re.sub(pattern, new_class, content)
            
    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Remaining HTML button classes fixed successfully.")
