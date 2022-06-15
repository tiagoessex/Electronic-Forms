
from django.db import connections
from django.db import connection
from django.conf import settings

from designer.utils import dictfetchall

# FIFO
TYPES = {
	'NUMBER': ['INT','TINYINT','SMALLINT','MEDIUMINT','BIGINT','FLOAT','DOUBLE', 'DECIMAL', 		# MYSQL
				'INTEGER','BIGSERIAL','BOOLEAN','DOUBLE PRECISION','MONEY','REAL','SMALLSERIAL',	# POSTGRESQL
				'BIT','SERIAL','NUMERIC',
				'NUMBER','RAW','BINARY_FLOAT','BINARY_DOUBLE'],	# ORACLE
	'DATE': ['DATE','YEAR','DATETIME','TIMESTAMP',
			],	# ORACLE],
	'TIME': ['TIME', 'DATETIME','TIMESTAMP',	# MYSQL
				'INTERVAL',	# POSTGRESQL
				],	# ORACLE
	'DROPDOWN': ['ENUM'],
	'TEXT': ['CHAR','VARCHAR','BLOB','TEXT','TINYBLOB','TINYTEXT','MEDIUMBLOB','MEDIUMTEXT','LONGBLOB','LONGTEXT','ENUM', 'DATETIME','TIMESTAMP', # MYSQL
				'POINT','GEOMETRY','LINESTRING','POLYGON','MULTIPOINT','MULTILINESTRING','MULTIPOLYGON','GEOMETRYCOLLECTION',
				'FLOAT','DOUBLE', 'DECIMAL',
				'CHARACTER VARYING','CHARACTER','BIT VARYING','BYTEA','CIDR','INET','CHAR',	# POSTGRESQL
				'NATIONAL CHARACTER','NATIONAL CHARACTER VARYING','MACADDR','UUID','XML','JSON',				
				'TSVECTOR','TSQUERY','ARRAY','TXID_SNAPSHOT',
				'BOX','CIRCLE','POINT','LINE','LSEG','PATH',
				'DOUBLE PRECISION','MONEY','REAL','SMALLSERIAL','BIGSERIAL','NUMERIC',
				'RAW','VARCHAR2','CLOB','BINARY_FLOAT','BINARY_DOUBLE'],	# ORACLE],
	
#	'GPS': ['POINT','GEOMETRY','LINESTRING','POLYGON','MULTIPOINT','MULTILINESTRING','MULTIPOLYGON','GEOMETRYCOLLECTION',  # MYSQL
#				'BOX','CIRCLE','POINT','LINE','LSEG','PATH']	# POSTGRESQL
}

# list all tables of current database
# ATT: postgresql TABLES CAN'T BE NEITHER IN pg_catalog NOR information_schema
LIST_TABLES = {
	'mysql': 'show tables;',
	'postgresql':"SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';",
	'oracle':'select table_name from user_tables order by table_name',
}

LIST_COLUMNS = {
	'mysql': 'SHOW FULL COLUMNS FROM ',	# + TABLE
	'postgresql':"""select column_name from information_schema.columns where table_name = '""",
	'oracle':"""select col.column_name
				from sys.all_tab_columns col
				inner join sys.all_tables t on col.owner = t.owner 
                		and col.table_name = t.table_name
				where col.table_name = '""",
}

LIST_COLUMNS_INFO = {
	'mysql': 'SHOW FULL COLUMNS FROM ',	# + TABLE
	'postgresql':"""select ordinal_position as position,
			column_name,
			data_type,
			case when character_maximum_length is not null
					then character_maximum_length
					else numeric_precision end as max_length,
			is_nullable,
			column_default as default_value
		from information_schema.columns
		where table_name = '""",
	'oracle':"""select col.column_name, 
			col.data_type, 
			col.data_length,
			col.data_default,
			col.nullable
		from sys.all_tab_columns col
		inner join sys.all_tables t on col.owner = t.owner 
			and col.table_name = t.table_name
		where col.table_name = '""",
}



def types_size(field):

	field = field.upper() 	
	start = field.find("(")
	end = field.find(")")
	size = None

	if start != -1 and end != -1:
		size = field[start+1:end]
		_field = field[0:start]
	else:
		_field = field
	
	if 'ENUM' in field:
		size = None#field.count(',') + 1

	types = []	
	for _type in TYPES:
		for t in TYPES[_type]:
			if _field == t:
				types.append(_type)
				break
	#if size == '1':
	#	types.append('CHECKBOX')
	#	types.append('RADIO')
	# all fields can be of these CHECKBOX | RADIOS | DROPDOWN
	#if 'CHECKBOX' not in types:
	types.append('CHECKBOX')
	#if 'RADIO' not in types:
	types.append('RADIO')
	#if 'DROPDOWN' not in types:
	types.append('DROPDOWN')

	if types[0] == 'NUMBER':# and field.find(",") != -1:
		size = None

	return types, size
	
def getDBBackend(db_name):
	"""Returns the database backend name (mysql, postgresql, sqlite3, oracle, ...) of given a database."""
	_parts = settings.FIELDS_ORIGIN_DATABASES[db_name]['ENGINE'].split('.')
	_type = _parts[len(_parts) - 1]
	return _type

def getDBsInfo():
	"""Return a list of all databases the server can be connected to and some info.
		Example:
		[
			{
				"id": "default",
				"name": "idrisk",
				"host": "127.0.0.1",
				"engine": 'mysql"
			},
			{
				"id": "asae",
				"name": "asae",
				"host": "127.0.0.1",
				"engine": 'mysql"
			}
		]	
	"""
	try:
		databases = []
		for key in settings.DATABASES.keys():
			databases.append({'id': key, 'name': settings.DATABASES[key]['NAME'], 
			'host':  settings.DATABASES[key]['HOST'], 
			'engine':  settings.DATABASES[key]['ENGINE']})
		return databases
	except Exception as e:
		print(e)
		raise e

def getDBs():
	"""
		Returns a list with the name of all databases where elements and data 
		can be extracted from, as defined in settings.py.
	"""
	try:
		databases = []
		for db in settings.FIELDS_ORIGIN_DATABASES.keys():
			databases.append(settings.FIELDS_ORIGIN_DATABASES[db]['NAME'])
		return databases
	except Exception as e:
		print(e)
		raise e


def getDBAndTables():
	"""Return json with all databases where elements and data can be extracted from and their respective tables."""
	try:
		data = {'databases': []}
		for key in settings.FIELDS_ORIGIN_DATABASES.keys():
			data['databases'].append({'parent':'#', 'id': key, 'text': key})
			with connections[key].cursor() as cursor:
				db_type = getDBBackend(key)
				cursor.execute(LIST_TABLES[db_type])
				for table in cursor.fetchall():
					if db_type == 'postgresql':
						_table = table[1]
					else:
						_table = table[0]
					data['databases'].append({'parent':key, 'id': _table, 'text': _table})

		return data
	except Exception as e:
		print(e)
		raise e


#{'position': 1, 
#'column_name': 'id', 
#'data_type': 'integer', 
#'max_length': 32, 
#'is_nullable': 'YES', 
#'default_value': None}

#{'Field': 'ID_AREA', 
#'Type': 'int(11)', 
#'Collation': None, 
#'Null': 'NO', 
#'Key': 'PRI', 
#'Default': None, 
#'Extra': '', 
#'Privileges': 'select,insert,update,references', 
#'Comment': ''}


def getDBTableColumnsInfo(database, table):
	"""Returns a json with all the columns from a table and their info (type, size, ...)."""
	try:
		with connections[database].cursor() as cursor:
			db_type = getDBBackend(database)
			#print("000000000 ", table)
			if db_type == 'postgresql' or db_type == 'oracle':
				cursor.execute(LIST_COLUMNS_INFO[db_type] + table + "';")
			else:
				cursor.execute(LIST_COLUMNS_INFO[db_type] + table)
			
			data = {"fields": dictfetchall(cursor)}
			#print(data)
			for i in data['fields']:
				##################
				### POSTGRESQL ###
				##################
				if db_type == 'postgresql':					
					i['Field'] = i['column_name']
					del i['column_name']

					new = types_size(i['data_type'])
					i['Types'] = new[0] # only the primary one
					del i['data_type']

					i['Size'] = i['max_length']
					del i['max_length']

					i['Default'] = i['default_value']
					del i['default_value']

					if i['is_nullable'] == 'NO':
						i['Required'] = True
					else:
						i['Required'] = False
					del i['is_nullable']

				elif db_type == 'oracle':					
					i['Field'] = i['COLUMN_NAME']
					del i['COLUMN_NAME']

					new = types_size(i['DATA_TYPE'])
					i['Types'] = new[0] # only the primary one
					del i['DATA_TYPE']

					i['Size'] = i['DATA_LENGTH']
					del i['DATA_LENGTH']

					i['Default'] = i['DATA_DEFAULT']
					del i['DATA_DEFAULT']

					if i['NULLABLE'] == 'N':
						i['Required'] = True
					else:
						i['Required'] = False
					del i['NULLABLE']

				else:
					#######################
					### MYSQL / MARIADB ###
					#######################
					new = types_size(i['Type'])
					i['Types'] = new[0] # only the primary one
					if 'TEXT' in i['Types'] or 'SELECT' in i['Types']:
						i['Size'] = new[1]
					#else:
					#	i['Size'] = '-'  
					#if i['Key']:    # TODO: IF FK? KEY OR DESCRIPTION?
					#    i['Types'].append('DROPDOWN')
					if i['Key'] == 'PRI' or i['Null'] == 'NO':
						i['Required'] = True
					else:
						i['Required'] = False
			return data
	except Exception as e:
		print(e)
		raise e

def getDBTables(database):
	"""Returns a list of all tables in a specific database where elements and data can be extracted from."""
	try:
		db = settings.FIELDS_ORIGIN_DATABASES[database]['NAME']
		tables = []
		with connections[db].cursor() as cursor:
			db_type = getDBBackend(db)
			cursor.execute(LIST_TABLES[db_type])			
			
			for table in cursor.fetchall():
				if db_type == 'postgresql':
					tables.append(table[1])	
				else:
					tables.append(table[0])	
		return tables
	except Exception as e:
		print(e)
		raise e

def getDBColumns(database, table):
	"""Returns a list of all columns/fields of a specific table of a specific database where
	elements and data can be extracted from."""
	try:
		db = settings.FIELDS_ORIGIN_DATABASES[database]['NAME']
		columns = []
		with connections[db].cursor() as cursor:
			db_type = getDBBackend(database)
			#cursor.execute(LIST_COLUMNS[db_type] + table)
			if db_type == 'postgresql' or db_type == 'oracle':
				cursor.execute(LIST_COLUMNS[db_type] + table + "';")
			else:
				cursor.execute(LIST_COLUMNS[db_type] + table)

			for col in cursor.fetchall():
				columns.append(col[0])
		return columns
	except Exception as e:
		print(e)
		raise e
		
def getDBColumnValues(database, table, column, unique = False):
	'''Return all the values of a columns of table of database where
	elements and data can be extracted from.'''	
	try:
		db = settings.FIELDS_ORIGIN_DATABASES[database]['NAME']
		values = []
		with connections[db].cursor() as cursor:
			db_type = getDBBackend(database)
			#cursor.execute("select " + column + " from " + table)
			if not unique:
				if db_type == 'postgresql':
					cursor.execute("select " + column + " from " + table + ";")
				else:
					cursor.execute("select " + column + " from " + table)
			else:
				if db_type == 'postgresql':
					cursor.execute("select DISTINCT " + column + " from " + table + ";")
				else:
					cursor.execute("select DISTINCT " + column + " from " + table)

			for val in cursor.fetchall():
				values.append(val[0])
		return values
	except Exception as e:
		print(e)
		raise e

def test():
    field_type = ['varchar(120)','longtext','int(11)','decimal(10,2)','mediumint(9)','date','char(1)']
    for _type in field_type:
	    types, size = types_size(_type)
	    print (_type, " | size > ", size , " | types > ",  types)