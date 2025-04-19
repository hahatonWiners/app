import pandas as pd
import numpy as np
from pymoo.core.problem import ElementwiseProblem
from pymoo.optimize import minimize
from pymoo.algorithms.moo.nsga2 import NSGA2
import os
from collections import Counter, defaultdict
from pymoo.operators.crossover.sbx import SBX
from pymoo.operators.mutation.pm import PM
from pymoo.operators.repair.rounding import RoundingRepair
import numpy as np
from pymoo.core.sampling import Sampling
from sklearn.preprocessing import MinMaxScaler


class AssetsProblem(ElementwiseProblem):
    RANDOM_SEED = 1210

    def __init__(self, data: pd.DataFrame, containers):
        super().__init__(n_var=len(data), n_obj=4, xl=0, xu=len(list(data.values())[0])-1, vtype=int)
        self.X = data
        self.priority_arrays = {k: v.iloc[:, 1].values for k, v in data.items()}
        self.container_weights = np.array([int(c[6:]) for c in containers])
        self.containers = containers
        self.container_types = [c[4:-5] for c in self.containers]

    def get_priorities(self, x):
        priorities = np.array([self.priority_arrays[cont_name][x[i]] for i, cont_name in enumerate(self.containers)])
        return priorities.sum()  # + (priorities >= 10).sum() * 1000

    
    def get_m(self, arr):
        counts = np.bincount(arr)
        return counts.max() - counts.min()

    
    def get_weight_diff(self, arr):
        from collections import defaultdict
        weights = defaultdict(int)
        for train, weight in zip(arr, self.container_weights):
            weights[train] += weight

        weight_values = np.array(list(weights.values()))
        return weight_values.max() - weight_values.min()
    
    def get_type_score(self, arr):
        trains = defaultdict(list)
        for train, cont_type in zip(arr, self.container_types):
            trains[train].append(cont_type)

        scores = []
        for cont_types in trains.values():
            counter = Counter(cont_types)
            _, best_count = counter.most_common(1)[0]
            score = best_count / len(cont_types)
            scores.append(score)

        return -np.mean(scores)

    def _evaluate(self, x: np.ndarray, out: dict, *args, **kwargs) -> None:

        priority_sum = self.get_priorities(x)
        m_diff = self.get_m(x)
        weight_diff = self.get_weight_diff(x)
        type_score = self.get_type_score(x)

        out['F'] = [priority_sum, m_diff, weight_diff, type_score]


class CustomCategoricalSampling(Sampling):
    def __init__(self, values_list, probs_list=None):
        super().__init__()
        self.values_list = values_list
        self.probs_list = probs_list
        
        if probs_list is not None and len(probs_list) != len(values_list):
            raise ValueError("probs_list and values_list must have the same length")

        if probs_list is not None:
            for p in probs_list:
                if not np.isclose(sum(p), 1):
                    raise ValueError("Probabilities for each variable must sum to 1")

    def _do(self, problem, n_samples, **kwargs):
        n_var = problem.n_var
        samples = np.empty((n_samples, n_var), dtype=int)
        
        for var_idx in range(n_var):
            values = self.values_list[var_idx]
            samples[:, var_idx] = np.random.choice(values, size=n_samples)
        return samples



def calculate(data_folder):

    containers = list(map(lambda name: name.split('.csv')[0], [f for f in os.listdir(data_folder) if f.endswith('.csv')]))
    trains = []
    data: dict[str: pd.DataFrame] = {}

    for cont_name in containers:
        data[cont_name] = pd.read_csv(data_folder + cont_name + '.csv')
        trains.append(list(range(len(data[cont_name]['номер поезда']))))

    algorithm = NSGA2(
        pop_size=100,
        sampling=CustomCategoricalSampling(values_list=trains),
        crossover=SBX(prob=0.9, repair=RoundingRepair()),
        mutation=PM(prob=0.1, repair=RoundingRepair()),
        eliminate_duplicates=True
    )
    problem = AssetsProblem(data, containers)

    res = minimize(problem,
        algorithm,
        ('n_gen', 100),
        verbose=False
    )

    F = res.F
    X = res.X

    scaler = MinMaxScaler()

    F_norm = scaler.fit_transform(F)

    weights = np.array([0.1, 1, 0.1, 0.1])

    weighted_sums = np.dot(F_norm, weights)

    best_idx = np.argmin(weighted_sums)

    best_solution = X[best_idx]

    output = pd.DataFrame({})
    output['container'] = containers
    output['train'] = [i.iloc[train, 0] for i, train in zip(data.values(), best_solution)]

    return output
