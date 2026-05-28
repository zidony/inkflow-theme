import re

filepath = 'src/link-list.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <div class="ink-card ink-card-hover link-featured-name"> with <div class="link-featured-name">
content = re.sub(r'class="ink-card ink-card-hover link-featured-', r'class="link-featured-', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed inner link-featured elements.')
