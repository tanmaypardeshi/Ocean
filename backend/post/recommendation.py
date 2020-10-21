def jaccard_similarity(list1, list2):
    s1 = set(list1)
    s2 = set(list2)
    return len(s1.intersection(s2)) / len(s1.union(s2))


def recommendation_system(user_tags, dataframe):
    JaccardSimilarity = []
    for i in range(len(dataframe)):
        JaccardSimilarity.append(jaccard_similarity(user_tags, dataframe.loc[i, ['tags']][0]))
    dataframe['Jaccard_Similarity'] = JaccardSimilarity
    dataframe['sum'] = dataframe['likes'] + dataframe['comments']
    dataframe = dataframe.sort_values(by=['Jaccard_Similarity', 'sum', 'date'], ascending=False)
    dataframe = dataframe.reset_index(drop=True)
    return dataframe
