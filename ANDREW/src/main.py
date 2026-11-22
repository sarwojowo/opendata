import multiprocessing
import flwr as fl
import os
import json

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from src.federated.server import get_strategy
from src.federated.client import client_fn
from src.utils.logger import FLLogger
from src.federated.client_loader import normalize_label

MODEL_NAME = "efficientnetb0"
STRATEGY_TYPE = "fedprox"
NUM_ROUNDS = 10
NUM_CLIENTS = 10
SPLIT_TYPE = "iid"

def get_num_classes(split_type):
    """Dynamically calculates the total number of classes from your dataset JSON"""
    path = f"data/federated_splits/{split_type}/client_maps.json"
    with open(path, "r") as f:
        client_map = json.load(f)
    all_labels = set()
    for items in client_map.values():
        for item in items:
            all_labels.add(normalize_label(item["label"]))
    return len(all_labels)

def main():
    num_classes = get_num_classes(SPLIT_TYPE)
    
    print(f"\n🚀 Starting Federated Learning Thesis Experiment")
    print(f"Strategy   : {STRATEGY_TYPE.upper()}")
    print(f"Model      : {MODEL_NAME}")
    print(f"Clients    : {NUM_CLIENTS}")
    print(f"Rounds     : {NUM_ROUNDS}")
    print(f"Classes    : {num_classes}\n") 

    logger = FLLogger(experiment_name=f"{MODEL_NAME}_{STRATEGY_TYPE}")
    
    strategy = get_strategy(
        model_name=MODEL_NAME,
        strategy_type=STRATEGY_TYPE,
        logger=logger,
        num_classes=num_classes
    )

    client_resources = {
        "num_cpus": 4,
        "num_gpus": 0.0  
    }
    
    fl.simulation.start_simulation(
        client_fn=lambda cid: client_fn(cid, split_type=SPLIT_TYPE, model_name=MODEL_NAME, num_classes=num_classes),
        num_clients=NUM_CLIENTS,
        config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
        strategy=strategy,
        client_resources=client_resources,
    )
    
    print(f"\n✅ Experiment Completed Successfully.")
    print(f"📊 Results saved to: {logger.get_path()}")

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()

    