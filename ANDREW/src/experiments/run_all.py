import time
import multiprocessing

from src.federated.server import start_server
from src.federated.client import client_fn
from src.utils.logger import FLLogger


# =========================
# CONFIG GRID (27 EXPERIMENTS)
# =========================
MODELS = ["mobilenetv2", "resnet50", "efficientnetb0"]
STRATEGIES = ["fedavg", "fedprox", "ftl"]
SPLITS = ["iid", "non_iid", "cross_domain"]

NUM_CLIENTS = 10
ROUNDS = 10


# =========================
# START CLIENT
# =========================
def start_client(client_id, split_type, model_name):
    from src.federated.client import FLClient

    client = client_fn(str(client_id))

    # override split/model dynamically
    client.split_type = split_type
    client.model_name = model_name

    import flwr as fl
    fl.client.start_numpy_client(
        server_address="127.0.0.1:8080",
        client=client
    )


# =========================
# RUN SINGLE EXPERIMENT
# =========================
def run_experiment(model, strategy, split):
    print("\n" + "=" * 60)
    print(f"🚀 Running: {model} | {strategy} | {split}")
    print("=" * 60)

    logger = FLLogger(f"{model}_{strategy}_{split}")

    # start server process
    server_process = multiprocessing.Process(
        target=start_server,
        kwargs={
            "model_name": model,
            "strategy_type": strategy,
            "rounds": ROUNDS,
            "logger": logger
        }
    )

    server_process.start()
    time.sleep(5)

    # start clients
    clients = []

    for i in range(NUM_CLIENTS):
        p = multiprocessing.Process(
            target=start_client,
            args=(i, split, model)
        )
        p.start()
        clients.append(p)
        time.sleep(0.3)

    # wait for server to finish
    server_process.join()

    # cleanup clients
    for c in clients:
        c.terminate()

    print(f"✅ Finished: {model} | {strategy} | {split}")
    print(f"📁 Log saved to: {logger.get_path()}")


# =========================
# MAIN LOOP (ALL EXPERIMENTS)
# =========================
if __name__ == "__main__":
    for model in MODELS:
        for strategy in STRATEGIES:
            for split in SPLITS:
                run_experiment(model, strategy, split)

    print("\n🎉 ALL EXPERIMENTS COMPLETED!")