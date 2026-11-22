import os
import csv
import subprocess


# =========================
# CONFIGURATION GRID
# =========================
MODELS = ["mobilenetv2", "resnet50", "efficientnetb0"]

STRATEGIES = ["fedavg", "fedprox", "ftl"]

SPLITS = ["iid", "non_iid", "cross_domain"]

ROUNDS = 10


# =========================
# CREATE OUTPUT DIR
# =========================
def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


# =========================
# RUN SINGLE EXPERIMENT
# =========================
def run_experiment(model, strategy, split):
    print(f"\n🚀 Running: {model} | {strategy} | {split}")

    cmd = [
        "python", "-m", "src.main",
        "--model", model,
        "--strategy", strategy,
        "--split", split,
        "--rounds", str(ROUNDS)
    ]

    subprocess.run(cmd)


# =========================
# MAIN EXPERIMENT LOOP
# =========================
def run_all_experiments():
    for model in MODELS:
        for strategy in STRATEGIES:
            for split in SPLITS:

                run_experiment(model, strategy, split)


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    run_all_experiments()