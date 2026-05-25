import sys
import os
import shutil
import subprocess
import json
import zipfile

# Fix Windows printing emoji encoding
sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("🚀 Starting release process...")
    
    # Run npm run build
    print("📦 Building project with Vite...")
    subprocess.run(["npm", "run", "build"], shell=True, check=True)
    
    # Read version from package.json
    with open("package.json", "r", encoding="utf-8") as f:
        pkg = json.load(f)
    version = pkg.get("version", "1.0.0")
    
    zip_filename = f"inkflow-theme-v{version}.zip"
    print(f"🗜️ Creating release archive: {zip_filename}")
    
    # Files to include
    include_files = ["README.md", "README.zh-CN.md"]
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add dist folder
        if os.path.exists("dist"):
            for root, dirs, files in os.walk("dist"):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Put files in the root of the zip
                    arcname = os.path.relpath(file_path, "dist")
                    zipf.write(file_path, arcname)
        
        # Add other files
        for f in include_files:
            if os.path.exists(f):
                zipf.write(f, f)
            else:
                print(f"⚠️ Warning: {f} not found.")
                
    print(f"✅ Release created successfully: {zip_filename}")

if __name__ == "__main__":
    main()
