import flwr as fl
from typing import List, Tuple, Optional
from flwr.common import FitRes, Parameters


# =========================
# FEDPROX STRATEGY
# =========================
def get_fedprox_strategy(initial_parameters, logger=None, fit_config_fn=None):

    class FedProxStrategy(fl.server.strategy.FedAvg):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

        # =========================
        # AGGREGATE EVALUATION (LOGGING FIXED)
        # =========================
        def aggregate_evaluate(
            self,
            server_round: int,
            results: List[Tuple],
            failures: List[BaseException],
        ):
            # 1. Let standard FedAvg aggregate the loss/accuracy from all clients
            loss_aggregated, metrics_aggregated = super().aggregate_evaluate(server_round, results, failures)

            # 2. Extract accuracy and write to our CSV!
            if logger is not None and loss_aggregated is not None:
                accuracies = [r.metrics.get("accuracy", 0.0) for _, r in results if r.metrics]
                avg_acc = sum(accuracies) / len(accuracies) if accuracies else 0.0
                
                logger.log(server_round, loss_aggregated, avg_acc, len(results))

            return loss_aggregated, metrics_aggregated

        # =========================
        # CLIENT CONFIGURATION
        # =========================
        def configure_fit(self, server_round: int, parameters, client_manager):
            config = super().configure_fit(server_round, parameters, client_manager)

            new_config = fit_config_fn(server_round) if fit_config_fn else {}
            new_config["round"] = server_round

            return [
                (client, fl.common.FitIns(parameters, new_config))
                for client, _ in config
            ]

    return FedProxStrategy(
        initial_parameters=initial_parameters,
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
    )