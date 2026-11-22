import flwr as fl
import tensorflow as tf
import csv
import os
import time
from datetime import datetime
import gc  # FIX 2, STEP A: Import the garbage collector

# Prevent TensorFlow from hogging all VRAM
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    try:
        tf.config.experimental.set_memory_growth(gpu, True)
    except:
        pass

from src.federated.client_loader import get_client_data
from src.models.mobilenetv2 import build_mobilenetv2
from src.models.resnet50 import build_resnet50
from src.models.efficientnetb0 import build_efficientnetb0

METRIC_FILE = "results/client_metrics.csv"

def log_metric(round_num, client_id, loss, acc, train_time, comm_time):
    os.makedirs("results", exist_ok=True)
    file_exists = os.path.isfile(METRIC_FILE)
    with open(METRIC_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "round", "client_id", "loss", "accuracy", "train_time", "comm_time"])
        writer.writerow([datetime.now(), round_num, client_id, loss, acc, train_time, comm_time])

def get_model(model_name="mobilenetv2", num_classes=2):
    if model_name == "mobilenetv2":
        return build_mobilenetv2(num_classes=num_classes)
    elif model_name == "resnet50":
        return build_resnet50(num_classes=num_classes)
    elif model_name == "efficientnetb0":
        return build_efficientnetb0(num_classes=num_classes)
    else:
        raise ValueError(f"Unknown model: {model_name}")

class FLClient(fl.client.NumPyClient):
    def __init__(self, client_id, split_type="iid", model_name="mobilenetv2", num_classes=2):
        self.client_id = client_id
        
        # Unpack the 4 variables from the bulletproof loader
        self.train_ds, self.val_ds, self.num_train_samples, self.num_val_samples = get_client_data(client_id, split_type)

        self.model = get_model(model_name, num_classes)

    def get_parameters(self, config):
        return self.model.get_weights()

    def fit(self, parameters, config):
        start_comm = time.time()
        self.model.set_weights(parameters)
        
        epochs = config.get("epochs", 5) 
        mu = config.get("mu", 0.01)
        ftl_mode = config.get("ftl_mode", False)
        round_num = config.get("round", 0)
        
        # Snapshot ONLY trainable weights to avoid the shape mismatch
        global_trainable_weights = [w.numpy() for w in self.model.trainable_weights]
        
        comm_time = time.time() - start_comm
        start_train = time.time()

        print(f"\n[Client {self.client_id}] 🚀 Round {round_num} - Training {epochs} Epochs...")

        step = 0
        for epoch in range(epochs):
            for x, y in self.train_ds:
                step += 1
                with tf.GradientTape() as tape:
                    preds = self.model(x, training=True)
                    ce_loss = tf.keras.losses.sparse_categorical_crossentropy(y, preds)
                    ce_loss = tf.reduce_mean(ce_loss)

                    if ftl_mode:
                        loss = ce_loss
                    else:
                        prox_loss = tf.add_n([
                            tf.reduce_sum(tf.square(w - w_global))
                            for w, w_global in zip(self.model.trainable_weights, global_trainable_weights)
                        ])
                        loss = ce_loss + (mu / 2.0) * prox_loss

                grads = tape.gradient(loss, self.model.trainable_weights)
                self.model.optimizer.apply_gradients(zip(grads, self.model.trainable_weights))

                if step % 2 == 0:
                    print(f"  [Client {self.client_id}] Epoch {epoch+1} Step {step} | Loss={loss.numpy():.4f}")
        
        if step == 0:
            print(f"❌ [ALARM] Client {self.client_id} processed 0 steps. Dataset is empty!")

        train_time = time.time() - start_train
        
        # Save weights before we destroy the model in RAM
        weights = self.model.get_weights()
        
        # ==========================================
        # FIX 2, STEP B: AGGRESSIVE RAM CLEANUP (FIT)
        # ==========================================
        tf.keras.backend.clear_session()
        gc.collect()
        
        return weights, self.num_train_samples, {"train_time": train_time}

    def evaluate(self, parameters, config):
        self.model.set_weights(parameters)
        round_num = config.get("round", 0)

        loss, acc = self.model.evaluate(self.val_ds, verbose=0)
        print(f"|-- [Client {self.client_id}] Eval: Loss {loss:.4f}, Acc {acc:.4f}")

        log_metric(round_num, self.client_id, float(loss), float(acc), 0.0, 0.0)

        # Save metrics before we destroy the model in RAM
        final_loss = float(loss)
        final_acc = float(acc)
        
        # ==========================================
        # FIX 2, STEP C: AGGRESSIVE RAM CLEANUP (EVAL)
        # ==========================================
        tf.keras.backend.clear_session()
        gc.collect()

        return final_loss, self.num_val_samples, {"accuracy": final_acc, "loss": final_loss}

def client_fn(cid: str, split_type="iid", model_name="mobilenetv2", num_classes=2):
    return FLClient(
        client_id=int(cid), 
        split_type=split_type, 
        model_name=model_name, 
        num_classes=num_classes
    ).to_client()