import glob
import re

css_files = glob.glob('src/assets/css/**/*.css', recursive=True)
pattern = re.compile(r'(\.[a-zA-Z0-9_-]+)\s*\{([^}]+)\}')

results = []
for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        matches = pattern.findall(content)
        for class_name, block in matches:
            # Count how many CSS rules are inside
            rules = [r.strip() for r in block.split(';') if r.strip()]
            
            # If it only has 1-3 rules, it might be a structural utility we can purge
            if len(rules) <= 3:
                is_structural = any(prop in block for prop in ['margin-', 'padding-', 'display: flex', 'text-align:', 'font-weight:'])
                if is_structural and not ('background' in block or 'color:' in block and 'border' not in block):
                    results.append(f"{class_name.ljust(25)} | Rules: {len(rules)} | Content: {block.strip()}")

for r in results:
    print(r)
