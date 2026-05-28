import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert overly aggressive replacements
    content = content.replace('ink-card ink-card-hover post-card-', 'post-card-')
    content = content.replace('ink-card ink-card-shadow sidebar-card-', 'sidebar-card-')
    content = content.replace('ink-card ink-card-xl ink-card-shadow profile-card-', 'profile-card-')
    content = content.replace('ink-card ink-card-hover category-card-', 'category-card-')
    content = content.replace('ink-card ink-card-hover link-card-', 'link-card-')
    content = content.replace('ink-card ink-card-hover album-card-', 'album-card-')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('HTML cleanup complete.')
