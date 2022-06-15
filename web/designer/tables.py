
import json 
import pandas as pd


def csv_to_json(csvfile):
    data = pd.read_csv(csvfile,sep=None)
    return json.loads(data.to_json(orient="records"))

def get_columns(csvfile):
    data = pd.read_csv(csvfile,sep=None)
    return list(data.columns)

def get_column_values(csvfile, column):
    df = pd.read_csv(csvfile,sep=None)
    return list(df[column].unique())