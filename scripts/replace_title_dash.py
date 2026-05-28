import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace EM dash with EN dash / standard minus sign
    if 'INKFLOW — ' in content:
        content = content.replace('INKFLOW — ', 'INKFLOW - ')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print('Title dash replacement complete.')
