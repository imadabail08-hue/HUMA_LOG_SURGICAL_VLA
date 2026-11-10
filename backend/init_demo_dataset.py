import shutil
from pathlib import Path
from app.services.dataset_service import DatasetService
from app.services.ai_engine import AIEngine

def init_demo():
    public_imgs = Path("public/images")
    if not public_imgs.exists():
        print("public/images introuvable")
        return

    images = list(public_imgs.glob("*.jpg"))
    if not images:
        print("Aucune image jpg trouvée")
        return

    # Check if demo dataset already exists
    datasets = DatasetService.list_datasets()
    if any(d.name == "Kit Chirurgical Démo" for d in datasets):
        print("Dataset de démo déjà présent.")
        return

    file_tuples = []
    for img_p in images:
        with open(img_p, "rb") as f:
            file_tuples.append((img_p.name, f.read()))

    ds_id = DatasetService.create_dataset_from_files(file_tuples, "Kit Chirurgical Démo")
    print(f"Dataset créé: {ds_id}")

    # Launch AI Auto-annotation on this demo dataset
    engine = AIEngine(model_name="yolov8n.pt")
    image_paths = DatasetService.list_image_paths(ds_id)

    def url_builder(p: Path) -> str:
        return f"/api/datasets/{ds_id}/raw/{p.name}"

    print("Exécution de l'auto-annotation par lot...")
    annotations = engine.annotate_batch(
        image_paths=image_paths,
        url_builder=url_builder,
        conf_threshold=0.15
    )
    DatasetService.save_annotations(ds_id, annotations)
    print(f"Demo initialisée avec succès ! ({len(annotations)} annotations enregistrées)")

if __name__ == "__main__":
    init_demo()
