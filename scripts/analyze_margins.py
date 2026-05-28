import glob
import re

css_files = glob.glob('src/assets/css/**/*.css', recursive=True)

pattern = re.compile(r'(\.[a-zA-Z0-9_-]+)\s*\{([^}]*(?:margin-bottom|margin-top):\s*[0-9.]+rem;[^}]*)\}')

results = []
for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        matches = pattern.findall(content)
        for class_name, block in matches:
            # We want to ignore very generic utilities or things where margin is the ONLY thing
            if "margin-bottom" in block or "margin-top" in block:
                # Extract the margin values
                mb = re.search(r'margin-bottom:\s*([0-9.]+rem);', block)
                mt = re.search(r'margin-top:\s*([0-9.]+rem);', block)
                mb_val = mb.group(1) if mb else "None"
                mt_val = mt.group(1) if mt else "None"
                results.append((f, class_name, mt_val, mb_val))

for f, c, mt, mb in results:
    print(f"{f} | {c} | MT: {mt} | MB: {mb}")
print("Analysis complete.")
