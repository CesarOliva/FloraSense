from pathlib import Path

base = Path(__file__).parent / "dataset" / "archive"

splits = ["Train/Train", "Validation/Validation", "Test/Test"]
classes = ["Healthy", "Powdery", "Rust"]

extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

for split in splits:
    print(f"\n{split}")

    for category in classes:
        folder = base / split / category

        if not folder.exists():
            print(f"  ERROR: No existe {folder}")
            continue

        images = [
            f for f in folder.iterdir()
            if f.is_file() and f.suffix.lower() in extensions
        ]

        print(f"  {category}: {len(images)} imágenes")