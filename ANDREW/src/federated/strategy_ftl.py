import flwr as fl
from typing import Optional, List, Tuple
from flwr.common import FitRes, Parameters


# =========================
# FTL STRATEGY (PERSONALIZED FL)
# =========================
def get_ftl_strategy(initial_parameters: Parameters, logger=None, fit_config_fn=None):

    class FTLStrategy(fl.server.strategy.FedAvg):
        def __init__(self):
            super().__init__(
                fraction_fit=1.0,
                fraction_evaluate=1.0,
                min_fit_clients=2,
                min_evaluate_clients=2,
                min_available_clients=2,
                initial_parameters=initial_parameters,
            )
            self.fit_config_fn = fit_config_fn

        def aggregate_fit(
            self,
            server_round: int,
            results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]],
            failures: List[BaseException],
        ) -> Optional[Parameters]:

            aggregated_parameters = super().aggregate_fit(server_round, results, failures)

            if logger:
                # Use server_round instead of rnd
                logger.log(
                    round_num=server_round,
                    loss=0.0,      # Populate these dynamically if clients send them
                    accuracy=0.0,
                    num_clients=len(results)
                )

            return aggregated_parameters

        def configure_fit(self, server_round: int, parameters, client_manager):
            config = super().configure_fit(server_round, parameters, client_manager)
            new_config = self.fit_config_fn(server_round) if self.fit_config_fn else {}
            new_config["round"] = server_round

            return [
                (client, fl.common.FitIns(parameters, new_config))
                for client, _ in config
            ]

    return FTLStrategy()