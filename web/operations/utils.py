
# given an object d, it recursevely searchs for relative URLS, that start with /
# it stores those in and array
def getRelativeUrls(d, arr):
  for k,v in d.items():        
     if isinstance(v, dict):
         getRelativeUrls(v, arr)
     else:
         if (v and isinstance(v, str) and v[0] == '/'):
             arr.append(v)