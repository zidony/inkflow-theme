import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    content = content.replace('class="sidebar-card', 'class="ink-card ink-card-shadow sidebar-card')
    content = content.replace('class="post-card', 'class="ink-card ink-card-hover post-card')
    content = content.replace('class="profile-card', 'class="ink-card ink-card-xl ink-card-shadow profile-card')
    content = content.replace('class="category-card', 'class="ink-card ink-card-hover category-card')
    content = content.replace('class="link-card', 'class="ink-card ink-card-hover link-card')
    content = content.replace('class="album-card', 'class="ink-card ink-card-hover album-card')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('HTML refactor complete.')
