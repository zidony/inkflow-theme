import glob
import re

html_files = glob.glob('src/**/*.html', recursive=True)

# Replacements dict based on user's style map
replacements = {
    # 2. Soft Buttons (Gradient)
    r'\bbtn-nav-login\b': 'ink-btn ink-btn-soft ink-btn-sm',
    r'\bbtn-subscribe\b': 'ink-btn ink-btn-soft w-100',
    r'\bbtn-auth\b': 'ink-btn ink-btn-soft w-100',
    r'\bbtn-hero-primary\b': 'ink-btn ink-btn-soft ink-btn-lg',
    r'\bbtn-apply\b': 'ink-btn ink-btn-soft ink-btn-lg',
    r'\bbtn-comment\b': 'ink-btn ink-btn-soft',
    r'\bbtn-submit\b': 'ink-btn ink-btn-soft',
    r'\bbtn-profile-save\s+btn-sm-profile\b': 'ink-btn ink-btn-soft ink-btn-sm',
    r'\bbtn-profile-save\b': 'ink-btn ink-btn-soft',
    
    # 3. Ghost Buttons (White outline)
    r'\bbtn-hero-ghost\b': 'ink-btn ink-btn-ghost ink-btn-lg',
    
    # 4. White Buttons (Card background with standard border)
    r'\bbtn-auth-social\b': 'ink-btn ink-btn-white w-100',
    r'\bbtn-profile-cancel\s+btn-sm-profile\b': 'ink-btn ink-btn-white ink-btn-sm',
    r'\bbtn-profile-cancel\b': 'ink-btn ink-btn-white',
    
    # Danger
    r'\bbtn-danger\b': 'ink-btn ink-btn-danger',
}

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    for pattern, new_class in replacements.items():
        if new_class not in content:
            content = re.sub(pattern, new_class, content)
            
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("HTML button classes updated successfully.")
