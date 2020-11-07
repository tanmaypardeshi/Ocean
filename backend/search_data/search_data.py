from fuzzywuzzy import fuzz


def search_results(dataframe, query):
    levenshtein = []
    for i in range(len(dataframe)):
        temp_string = str(dataframe.loc[i, ['title']])
        levenshtein.append(fuzz.token_set_ratio(temp_string, query))
    dataframe['levenshtein_distance'] = levenshtein
    dataframe = dataframe.sort_values(by=['levenshtein_distance'], ascending=False)
    dataframe = dataframe.reset_index(drop=True)
    dataframe = dataframe.loc[:10, :]
    return dataframe
