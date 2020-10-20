def jaccard_similarity(list1, list2):
  s1 = set(list1)
  s2 = set(list2)
  return len(s1.intersection(s2)) / len(s1.union(s2))

def recommendation_system(user_tags,df):
  jacc_simi=[]
  for i in range(len(df)):
    jacc_simi.append(jaccard_similarity(user_tags,(np.array(df.loc[i,['tags']])[0])))
  df['jacc_similarity']=jacc_simi
  df['sum']=df['comments']+df['likes']
  return ((df.sort_values(by=['jacc_similarity','sum','date'],ascending=False)).loc[:,['email','title','posts','tags']])
