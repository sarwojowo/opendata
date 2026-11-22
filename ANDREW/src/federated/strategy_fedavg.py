import flwr as fl
from flwr.common import FitRes, Parameters
from typing import List, Tuple, Optional


# =========================
# CUSTOM FEDAVG WITH LOGGING
# =========================
class FedAvgWithLogger(fl.server.strategy.FedAvg):
    def __init__(self, logger=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logger

    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]],
        failures: List[BaseException],
    ) -> Optional[Parameters]:

        aggregated = super().aggregate_fit(server_round, results, failures)

        if self.logger is not None and results:
            losses = []
            accs = []

            for _, fit_res in results:
                if fit_res.metrics:
                    losses.append(fit_res.metrics.get("loss", 0))
                    accs.append(fit_res.metrics.get("accuracy", 0))

            avg_loss = sum(losses) / len(losses) if losses else 0.0
            avg_acc = sum(accs) / len(accs) if accs else 0.0

            self.logger.log(
                round_num=server_round,
                loss=avg_loss,
                accuracy=avg_acc,
                num_clients=len(results),
            )

        return aggregated

    def configure_fit(self, server_round: int, parameters, client_manager):
        config = super().configure_fit(server_round, parameters, client_manager)
        if self.on_fit_config_fn:
            custom_config = self.on_fit_config_fn(server_round)
            custom_config["round"] = server_round
            return [
                (client, fl.common.FitIns(parameters, custom_config))
                for client, _ in config
            ]
        return config


# =========================
# FACTORY FUNCTION
# =========================
def get_fedavg_strategy(initial_parameters, logger=None, fit_config_fn=None):

    return FedAvgWithLogger(
        logger=logger,
        initial_parameters=initial_parameters,
        on_fit_config_fn=fit_config_fn,
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
    )