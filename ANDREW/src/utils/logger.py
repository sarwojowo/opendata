import csv
import os
from datetime import datetime


class FLLogger:
    def __init__(self, experiment_name="fl_experiment"):
        self.experiment_name = experiment_name
        self.log_dir = "outputs/logs"
        os.makedirs(self.log_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.file_path = f"{self.log_dir}/{experiment_name}_{timestamp}.csv"

        with open(self.file_path, mode="w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "round",
                "loss",
                "accuracy",
                "num_clients"
            ])

    # =========================
    # SAFE LOGGING FUNCTION
    # =========================
    def log(self, round_num, loss, accuracy, num_clients):
        loss = float(loss) if loss is not None else 0.0
        accuracy = float(accuracy) if accuracy is not None else 0.0

        with open(self.file_path, mode="a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                round_num,
                loss,
                accuracy,
                num_clients
            ])

    def get_path(self):
        return self.file_path