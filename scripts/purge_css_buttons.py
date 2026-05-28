import glob
import re

css_files = glob.glob('src/assets/css/**/*.css', recursive=True)

# List of old CSS classes to completely remove
classes_to_remove = [
    'btn-nav-login',
    'btn-apply',
    'btn-submit',
    'btn-subscribe',
    'btn-comment',
    'btn-hero-primary',
    'btn-hero-ghost',
    'btn-auth',
    'btn-auth-social',
    'btn-profile-save',
    'btn-profile-cancel',
    'btn-danger'
]

def purge_css_class(content, class_name):
    # Matches .class_name { ... }
    # Also .class_name:hover { ... }, .class_name.active { ... }
    # Need to handle nested curly braces? In this CSS they are simple.
    
    # regex for .class-name, .class-name:hover, .class-name.active
    # Pattern: \.class_name(?:[:.a-zA-Z0-9_-]+)?\s*\{[^}]+\}
    pattern = fr'\.{class_name}(?:[:.a-zA-Z0-9_-]+)?\s*\{{[^}}]+\}}'
    return re.sub(pattern, '', content)

for f in css_files:
    if 'button.css' in f: continue # Don't touch our new component!
    
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    for cls in classes_to_remove:
        content = purge_css_class(content, cls)
        
    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("CSS purging complete.")
