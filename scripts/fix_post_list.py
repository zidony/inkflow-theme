import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert overly aggressive replacements
    content = content.replace('class="post-list-item', 'class="ink-card ink-card-hover post-list-item')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('HTML post-list-item refactor complete.')
