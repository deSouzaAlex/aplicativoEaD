"""
Fase 2 do módulo preditivo (RF07): treino e comparação de classificadores
supervisionados para estimar o risco de uma tarefa ser entregue fora do prazo.

Entrada: CSV gerado por `npm run exportar:dataset` (backend) ou pela rota
GET /api/v1/analise/dataset?formato=csv. A coluna-alvo é `atrasou` (1 = fora do prazo).

Modelos comparados: regressão logística, árvore de decisão e floresta aleatória,
com validação cruzada estratificada e métricas de precisão, revocação e F1.
Conforme a metodologia, a revocação é a métrica prioritária.

Uso:
    pip install -r requirements.txt
    python treinar_modelos.py dataset.csv [--folds 5] [--saida resultados.csv]
    python treinar_modelos.py --sintetico 400     # demonstração com dados simulados
"""
import argparse
import sys

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

ATRIBUTOS = [
    "antecedenciaCadastroDias",
    "tarefasAbertasJanela",
    "prioridadeNum",
    "diaSemanaPrazo",
    "historicoTarefas",
    "taxaAtrasoAnterior",
]
ALVO = "atrasou"


def gerar_sintetico(n, semente=42):
    """Dados simulados apenas para demonstrar o pipeline enquanto a base real é pequena."""
    rng = np.random.default_rng(semente)
    df = pd.DataFrame({
        "antecedenciaCadastroDias": rng.gamma(2.0, 4.0, n).round(2),
        "tarefasAbertasJanela": rng.poisson(2.0, n),
        "prioridadeNum": rng.integers(1, 4, n),
        "diaSemanaPrazo": rng.integers(0, 7, n),
        "historicoTarefas": rng.integers(0, 40, n),
    })
    df["taxaAtrasoAnterior"] = np.where(df["historicoTarefas"] > 0, rng.beta(2, 5, n).round(3), np.nan)
    logito = (
        -1.2
        - 0.12 * df["antecedenciaCadastroDias"]
        + 0.45 * df["tarefasAbertasJanela"]
        + 2.5 * df["taxaAtrasoAnterior"].fillna(0.2)
        - 0.15 * df["prioridadeNum"]
    )
    df[ALVO] = (rng.random(n) < 1 / (1 + np.exp(-logito))).astype(int)
    return df


def modelos(semente=42):
    imputar = lambda: SimpleImputer(strategy="median")  # noqa: E731
    return {
        "Regressão logística": make_pipeline(
            imputar(), StandardScaler(), LogisticRegression(class_weight="balanced", max_iter=1000)
        ),
        "Árvore de decisão": make_pipeline(
            imputar(), DecisionTreeClassifier(max_depth=4, class_weight="balanced", random_state=semente)
        ),
        "Floresta aleatória": make_pipeline(
            imputar(),
            RandomForestClassifier(n_estimators=300, max_depth=6, class_weight="balanced", random_state=semente),
        ),
    }


def avaliar(df, folds=5, semente=42):
    X = df[ATRIBUTOS].astype(float)
    y = df[ALVO].astype(int)
    minoritaria = int(y.value_counts().min()) if y.nunique() == 2 else 0
    if minoritaria < 2:
        sys.exit("É preciso ao menos 2 exemplos de cada classe (no prazo e com atraso) para a validação cruzada.")
    folds = max(2, min(folds, minoritaria))
    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=semente)

    linhas = []
    for nome, modelo in modelos(semente).items():
        r = cross_validate(modelo, X, y, cv=cv, scoring=["precision", "recall", "f1"], error_score=0)
        linhas.append({
            "modelo": nome,
            "precisao": r["test_precision"].mean(),
            "revocacao": r["test_recall"].mean(),
            "revocacao_dp": r["test_recall"].std(),
            "f1": r["test_f1"].mean(),
        })
    resultados = pd.DataFrame(linhas).sort_values(["revocacao", "f1"], ascending=False)

    melhor = resultados.iloc[0]["modelo"]
    floresta = modelos(semente)["Floresta aleatória"].fit(X, y)
    importancias = pd.Series(floresta[-1].feature_importances_, index=ATRIBUTOS).sort_values(ascending=False)
    return resultados, melhor, importancias, folds


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv", nargs="?", help="arquivo CSV exportado pela aplicação")
    parser.add_argument("--folds", type=int, default=5)
    parser.add_argument("--saida", help="grava a tabela de resultados em CSV")
    parser.add_argument("--sintetico", type=int, metavar="N", help="usa N exemplos simulados")
    args = parser.parse_args()

    if args.sintetico:
        df = gerar_sintetico(args.sintetico)
        print(f"Usando {len(df)} exemplos SIMULADOS (demonstração).")
    elif args.csv:
        df = pd.read_csv(args.csv)
        print(f"{len(df)} exemplos lidos de {args.csv}.")
    else:
        parser.error("informe o CSV ou --sintetico N")

    print(f"Proporção de entregas com atraso: {df[ALVO].mean():.1%}")
    resultados, melhor, importancias, folds = avaliar(df, args.folds)
    print(f"\nValidação cruzada estratificada com {folds} partições:\n")
    print(resultados.to_string(index=False, float_format=lambda v: f"{v:.3f}"))
    print(f"\nMelhor modelo segundo a revocação: {melhor}")
    print("\nImportância dos atributos (floresta aleatória):")
    print(importancias.to_string(float_format=lambda v: f"{v:.3f}"))
    if args.saida:
        resultados.to_csv(args.saida, index=False)
        print(f"\nResultados gravados em {args.saida}")


if __name__ == "__main__":
    main()
