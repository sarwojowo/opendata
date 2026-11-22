import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("results/client_metrics.csv")

avg = df.groupby("round")["accuracy"].mean()

plt.plot(avg.index, avg.values, marker="o")
plt.title("Federated Learning Accuracy per Round")
plt.xlabel("Round")
plt.ylabel("Accuracy")
plt.grid()
plt.show()