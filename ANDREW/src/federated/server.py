import flwr as fl
from flwr.common import ndarrays_to_parameters

from src.models.mobilenetv2 import build_mobilenetv2
from src.models.resnet50 import build_resnet50
from src.models.efficientnetb0 import build_efficientnetb0

from src.federated.strategy_fedavg import get_fedavg_strategy
from src.federated.strategy_fedprox import get_fedprox_strategy
from src.federated.strategy_ftl import get_ftl_strategy

def get_initial_parameters(model_name: str, num_classes: int):
    if model_name == "mobilenetv2":
        model = build_mobilenetv2(num_classes=num_classes)
    elif model_name == "resnet50":
        model = build_resnet50(num_classes=num_classes)
    elif model_name == "efficientnetb0":
        model = build_efficientnetb0(num_classes=num_classes)
    else:
        raise ValueError(f"Unknown model: {model_name}")

    return model.get_weights()

def get_fit_config(strategy_type: str):
    def fit_config(server_round: int):
        if strategy_type == "fedprox":
            return {"epochs": 5, "mu": 0.01, "ftl_mode": False}
        elif strategy_type == "ftl":
            return {"epochs": 5, "ftl_mode": True}
        else:  # fedavg
            return {"epochs": 5, "ftl_mode": False}
    return fit_config

def get_strategy(model_name="mobilenetv2", strategy_type="fedavg", logger=None, num_classes=2):
    # Pass the dynamic num_classes down
    initial_weights = get_initial_parameters(model_name, num_classes)
    initial_parameters = ndarrays_to_parameters(initial_weights)

    fit_config_fn = get_fit_config(strategy_type)

    if strategy_type == "fedavg":
        return get_fedavg_strategy(initial_parameters, logger, fit_config_fn)
    elif strategy_type == "fedprox":
        return get_fedprox_strategy(initial_parameters, logger, fit_config_fn)
    elif strategy_type == "ftl":
        return get_ftl_strategy(initial_parameters, logger, fit_config_fn)
    else:
        raise ValueError(f"Unknown strategy: {strategy_type}")