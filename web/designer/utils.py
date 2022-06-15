# required for the raw queries
def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def get_key(dic, val, index):
    for key, value in dic.items():
         if val == value[index]:
             return key



