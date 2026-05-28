import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert overly aggressive replacements
    content = content.replace('class="link-featured', 'class="ink-card ink-card-hover link-featured')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('HTML link-featured refactor complete.')
