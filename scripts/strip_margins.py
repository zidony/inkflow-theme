import glob
import re

css_files = glob.glob('src/assets/css/**/*.css', recursive=True)
html_files = glob.glob('src/**/*.html', recursive=True)

# Components to strip margin from
targets = {
    'category-group-header': 'mb-4', # 1.5rem
    'article-cover': 'mb-4', # 2rem -> mb-4 is 1.5rem, mb-5 is 3rem. Wait, let's use mb-4
    'filter-bar': 'mb-4', # 2rem
    'auth-brand': 'mb-4', # 2rem
    'sidebar-card': 'mb-4', # 1.5rem
    'masonry-section': 'mt-5', # 4rem -> mt-5
    'comment-section': 'mt-5', # 3rem -> mt-5
    'hero-stats': 'mt-5', # 3rem -> mt-5
}

# 1. Update HTML
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    for cls, util in targets.items():
        # Match class="... cls ..." and append util if not already there
        # This is a bit tricky with regex, simpler is just replace
        # e.g., class="category-group-header" -> class="category-group-header mb-4"
        content = re.sub(fr'class="([^"]*)\b{cls}\b([^"]*)"', lambda m: f'class="{m.group(1)}{cls} {util}{m.group(2)}"' if util not in m.group(0) else m.group(0), content)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# 2. Update CSS
for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    for cls in targets.keys():
        # find .cls { ... } and remove margin-bottom or margin-top
        # regex to match margin-top or bottom inside the block
        
        # A simpler way: we know they are mostly simple lines like "margin-bottom: 2rem;"
        # We can just use re.sub on the specific class block
        # But writing a solid parser is safer.
        pass

    # Actually, string replacement for known lines is safer
    replacements = [
        ('margin-bottom: 1.5rem;', '/* margin-bottom stripped to HTML mb-4 */'),
        ('margin-bottom: 2rem;', '/* margin-bottom stripped to HTML mb-4 */'),
        ('margin-top: 4rem;', '/* margin-top stripped to HTML mt-5 */'),
        ('margin-top: 3rem;', '/* margin-top stripped to HTML mt-5 */'),
    ]
    
    # We only apply these replacements to lines inside the target classes
    def replace_margins(match):
        block = match.group(0)
        for r_old, r_new in replacements:
            block = block.replace(r_old, r_new)
        return block

    for cls in targets.keys():
        content = re.sub(fr'\.{cls}\s*\{{[^}}]+\}}', replace_margins, content)

    # Purge Dead Utilities
    content = re.sub(r'\.flex-y-center\s*\{[^}]+\}', '', content)
    content = re.sub(r'\.flex-between-center\s*\{[^}]+\}', '', content)
    
    # Also replace stat-item in CSS
    content = re.sub(r'\.stat-item\s*\{\s*text-align:\s*center;\s*\}', '', content)
    
    # Also replace auth-input-group in CSS
    content = re.sub(r'\.auth-input-group\s*\{\s*margin-bottom:\s*1rem;\s*\}', '', content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# 3. HTML updates for purged classes
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # stat-item -> text-center
    content = re.sub(r'\bstat-item\b', 'text-center', content)
    # auth-input-group -> mb-3
    content = re.sub(r'\bauth-input-group\b', 'mb-3', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Margin stripping and utility purging complete.")
