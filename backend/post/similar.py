from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('bert-base-nli-mean-tokens')


def top_similar(query_summary, dataframe):
    SimilarityWithQuery = []
    query_vec = model.encode([query_summary])[0]
    query_vec = query_vec.reshape(1, -1)
    for i in range(len(dataframe)):
        temp = str(dataframe.loc[i, ['summaries']])
        temp_vec = model.encode([temp])[0]
        temp_vec = temp_vec.reshape(1, -1)
        SimilarityWithQuery.append(cosine_similarity(query_vec, temp_vec))
    dataframe['cosine_similarity'] = SimilarityWithQuery
    dataframe = dataframe.sort_values(by=['cosine_similarity'], ascending=False)
    dataframe = dataframe.reset_index(drop=True)
    dataframe = dataframe.loc[1:2, :]
    dataframe = dataframe.reset_index(drop=True)
    return dataframe
