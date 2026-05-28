import os
import glob

html_files = glob.glob('src/**/*.html', recursive=True)
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert overly aggressive replacements
    content = content.replace('assets/js/main.js', 'assets/js/inkflow.js')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('HTML rename main.js to inkflow.js complete.')
