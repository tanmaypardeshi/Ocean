#!pip install sentence-transformers

from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('bert-base-nli-mean-tokens')


def top_similar(query_summary, df):
    cos_similarity = []
    query_vec = model.encode([query])[0]
    query_vec = query_vec.reshape(1, -1)
    for i in range(len(df)):
        temp = str(df.loc[i, ['summaries']])
        temp_vec = model.encode([temp])[0]
        temp_vec = temp_vec.reshape(1, -1)
        cos_similarity.append(cosine_similarity(query_vec, temp_vec))
    df['cosine_similarity'] = cos_similarity
    retrun((df.sort_values(by=['cosine_similarity'], ascending=False)).loc[[0, 1], ['email', 'title', 'posts', 'tags']])
