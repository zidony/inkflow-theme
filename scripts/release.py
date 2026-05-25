import os
import json
import zipfile

def release():
    print("=== Starting inkflow-theme automated release packaging ===")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_dir = os.path.join(root_dir, "dist")
    release_dir = os.path.join(root_dir, "releases")
    package_json_path = os.path.join(root_dir, "package.json")

    if not os.path.exists(dist_dir):
        print("Error: 'dist/' directory does not exist! Please run 'npm run build' first.")
        raise SystemExit(1)

    version = "1.0.0"
    name = "inkflow-theme"
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                pkg = json.load(f)
                version = pkg.get("version", version)
                name = pkg.get("name", name)
        except Exception as e:
            print(f"Warning: could not read package.json: {e}")

    os.makedirs(release_dir, exist_ok=True)

    zip_filename = f"{name}-v{version}.zip"
    zip_path = os.path.join(release_dir, zip_filename)

    if os.path.exists(zip_path):
        os.remove(zip_path)
        print(f"Removed old package: {zip_filename}")

    print(f"Creating ZIP archive: releases/{zip_filename}...")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_abs_path, dist_dir)
                zip_file.write(file_abs_path, rel_path)

        for file in os.listdir(root_dir):
            if file.lower().startswith("readme") and file.lower().endswith(".md"):
                readme_path = os.path.join(root_dir, file)
                zip_file.write(readme_path, file)
                print(f"Added to ZIP: {file}")

    print(f"=== Success! Package created: releases/{zip_filename} ===")
    print(f"File size: {os.path.getsize(zip_path) / 1024:.2f} KB")

if __name__ == "__main__":
    release()
