# Forms XXX

## Content

  * [Version](#version)
  * [Description](#description)
  * [Requirements](#requirements)
  * [.env](#env)
  * [Installation and Execution](#installation-and-execution)
  	+ [Deploy with Docker](#deploy-with-docker)
	+ [Development without Docker](#development-without-docker)  	
  * [Automatic tasks](#automatic-tasks)
  * [Databases](#databases)
  * [Essential Tables](#essential_tables)
    + [AssetType Table](#assettype-table)
    + [Status Table](#status-table)
    + [Files Table](#files-table)
  * [Notes and Documents](#notes-and-documents)
  * [Smart Card Signing](#smart-card-signing)  
  * [Roadmap W40+](#roadmap-W40+)
  * [License](#license)


## Version

0.2

## Description
* Forms something XXX.

## Requirements

* Python >= 3.7.x

## .env

Use the **/idrisk/_env** example to create a **.env** file with the correct settings.

The databases hosts present in the *.env* file, depends whether is running in docker containers or natively. So, have that in consideration.


## Installation and Execution

Global Notes:

* By default, the repository is set for **production**:
	+ all *debug* settings are set to false
	+ no console messages, other than *errors* and *warnings*

* By default, the django application is set for production, with **DEBUG = False** at [settings.py](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/idrisk/settings.py) (at */web/idrisk/*)

* By default, client side console messages (*LOG, DEBUG, INFO*) are **disabled**. To enabled them, set *DEBUG* to *true* in these files:
	+ [/web/templates/base.html](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/templates/base.html)
	+ [/web/designer/templates/designer/_scripts.html](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/designer/templates/designer/_scripts.html)

You can also add others console messages to the list of messages to enable/disable, such as *warn* and *error*, however it's not recommended to disable these two.


### Deploy with Docker


1. Install both **docker** and **docker-compose**:
- docker: [https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/) or [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)
- docker-compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/) or [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)


2. Clone repository:

```bash
git clone https://gitlab.com/arkhamlord666/forms
```


3. Settings files:

* [docker-compose.yml](https://gitlab.com/arkhamlord666/forms/-/blob/master/docker-compose.yml)  (at */*)
	+ If desired, change the database root password, *MYSQL_ROOT_PASSWORD* in [docker-compose.yml](https://gitlab.com/arkhamlord666/forms/-/blob/master/docker-compose.yml).

* [_env](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/idrisk/_env/) (at */web/idrisk/*)
	+ Rename *_env* file to *.env* and change its contents accordingly (see next).
	+ Comment (add **#** at the start of the line) or remove all unecessary lines.
	+ Define a *SECRET_KEY* if desired. If not, comment or remove the line. A random key will be generated for you.
	+ Change the *IDRISK* and *WORLD* databases hosts to *db*, if not already. 
So, for example, if _IDRISK_URL=mysql://[USERNAME]:[PASSWORD]@127.0.0.1:3306/idrisk_, then it becomes *IDRISK_URL=mysql://[USERNAME]:[PASSWORD]@db:3306/idrisk*. 
	+ By default, *USERNAME* = *root* and *PASSWORD* = *pass2022*.  Change it, if *MYSQL_ROOT_PASSWORD* at *docker-compose.yml* was also changed.
	+ Make sure *DEBUG* is set to *False* in *.env*  -- **IMPORTANT** -- otherwise, static files (*js* and *css* files) won't be collected correctly and the application may not work properly.
	+ If desired, set the email credentials. This email, will be used by the system to notify users, in case of password changes, etc.


4. Build:
```bash
docker-compose build
```


All necessary databases will be automatically created and populated. They also contain 6 forms and a default superuser.

A default superuser (*admin*) is already present. The password should be *pass2022* (**change it after  installation is completed**).


5. Execution:

```bash
docker-compose up
```

or for running in the background (prefered):

```bash
docker-compose up -d
```

Page will be available at: *http://127.0.0.1* (if running on a local computer) or *http[s]://domain|ip* (if on a server).

6. Stop execution:
```bash
docker-compose stop
```


**IF POINTS 1 TO 4 WERE FOLLOWED, AND NOTHING ELSE WAS CHANGED, THE REMAINING CHAPTER ISN'T NECESSARY AND IT CAN BE SKIPPED!!!**

* Migrations (if blank slate, make sure to restore the essential tables, otherwise, the app will fail):
```bash
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate
```

* Create an administration account:
```bash
docker-compose exec web python manage.py createsuperuser
```

* Restore database X from a sql file:
```bash
docker exec -i mariadb mysql --user=[USERNAME] --password=[PASSWORD] X < dumpfile.sql
```


### Development without Docker

**INCOMPLETE**
**INCOMPLETE**
**INCOMPLETE**
**INCOMPLETE**

* All operations should be done at the */web/* folder level.
* All necessary databases to restore the most up to date version of the database are present in [databases](https://gitlab.com/arkhamlord666/forms/-/blob/master/databases/) directory. Restoring avoids the need to create +  apply migrations + populate essential tables. It also contains 3 + 3 forms and a default superuser.
* A default superuser (*admin*) is already present. The password is *pass2022* (**change it after a successfully completed installation**).


1. Clone repository:

```bash
git clone https://gitlab.com/arkhamlord666/forms
```


2. Settings files:

* [_env](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/idrisk/_env/) (at */web/idrisk/*)
	+ Rename *_env* file to *.env* and change its contents accordingly (see next).
	+ Comment (add **#** at the start of the line) or remove all unecessary lines.
	+ Define a *SECRET_KEY* if desired. If not, comment or remove the line. A random key will be generated for you.
	+ Change the *IDRISK* and *WORLD* databases hosts to *127.0.0.1*, if not already. 
So, for example, if _IDRISK_URL=mysql://[USERNAME]:[PASSWORD]@db:3306/idrisk_, then it becomes *IDRISK_URL=mysql://[USERNAME]:[PASSWORD]@127.0.0.1:3306/idrisk*. 
	+ Make sure *DEBUG* is set to *True* in *.env*  -- **IMPORTANT** -- otherwise, static files (*js* and *css* files) won't be serve correctly
	+ If desired, set the email credentials. This email, will be used by the system to notify users, in case of password changes, etc.

* Enable the console messages (check global notes at the beginning of this chapter)


3. Install dependencies:

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install the necessary packages.

```bash
pip install django==3.1.7
pip install mysqlclient==2.0.3	# is mysql
pip install django-adminlte3==0.1.6
pip install django-environ==0.4.5
pip install django-cors-headers==3.7.0
pip install djangorestframework==3.12.2
pip install pandas==1.2.4			# required for tables
pip install django_cleanup==5.2.0	# model record deleted => fielfield file deleted
pip install django-q==1.3.9
pip install cx-Oracle==8.1.0    # if oracle
pip install psycopg2==2.9.1    	# if postgresql
pip install js_regex==1.0.1		# js regex to python - required for mirror validation
pip install django-pwa==1.0.10
pip install gunicorn==20.1.0
```

Or just:

```bash
pip install -r requirements.txt
```

4. Create superuser, if clean slate:

Create a superuser:
```bash
python manage.py createsuperuser
```

5. Apply migrations, if clean slate:

Migrations (only if clean slate - also check Essential Tables chapter, otherwise, restore with the databases present at [databases](https://gitlab.com/arkhamlord666/forms/-/blob/master/databases/):

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Execute:

Executing:
```bash
python manage.py runserver
```

* The application will be available at: *http://127.0.0.1:8000* (if running on a local computer) or *http[s]://domain|ip:8000* (if on a server).




## Automatic tasks

* Daily removal of all temporary forms.
* Daily removal of all empty assets folders (forms and operations).


## Databases

The application is set to use either MySql or MariaDB as its database.
However, it supports other databases, that can be used for creating elements and/or perform queries over:
* MySql
* MariaDB
* PostgreSQL
* Oracle

The current project requires a MySql/MariaDB database named IDRISK.
Use [idrisk.sql](https://gitlab.com/arkhamlord666/forms/-/blob/master/databases/idrisk.sql) to restore the most up to date version of the database, which also avoids the need to create and apply migrations.

A [world.sql](https://gitlab.com/arkhamlord666/forms/-/blob/master/_databases/world.sql) database is also provided to be used for follow the [Example](https://gitlab.com/arkhamlord666/forms/-/blob/master/help/templates/help/examples/_examples.html) #3.


For **PostgreSQL** databases, it's necessary to specify the schema:

* In the *.env* file:

```
POSTGRE_URL=postgresql://[user]:[password]@[host]:[port]/[database_name]
POSTGRE_SCHEMA=[schema_name]
```

* In the *settings.py* file:

```
OPTIONS={'OPTIONS': {'options': '-c search_path=' + env('POSTGRE_SCHEMA')}}
POSTGRE = env.db('POSTGRE_URL')
POSTGRE.update(OPTIONS)
...
'postgreDB': POSTGRE,
```

For **Oracle** databases, it will assume the default previleges associated with the connection settings.

## Essential Tables

In case of a clean slate, make sure to populate the following tables with the provided values.

### AssetType Table

```
INSERT INTO `assettype` (`id`, `name`) VALUES
	(1, 'IMAGE'),
	(2, 'CSV'),
	(3, 'JSON'),
	(4, 'PDF'),
	(5, 'OTHER'),;
```

### Status Table

```
INSERT INTO `status` (`id`, `name`, `description`) VALUES
	(2, 'CLOSED', 'Filling is completed and ready for data transfer.'),
	(3, 'OPEN', 'Form is being filled.'),
	(4, 'COMPLETED', 'Filling compelted + data in the database.'),
	(5, 'LOCKED', NULL),
	(6, 'DISABLED', 'Form is disabled => not editable, not usable. Obsolete.'),
	(7, 'TEMPORARY', 'Temporary form. Can be removed or saved (=> not temp anymore) - Designer'),
	(8, 'IN USE', 'Form is current and usable. Not editable.'),
	(9, 'EDITABLE', 'Form can be edited.'),
	(10, 'NONE', 'Nothing.');
```

### Files Table

```
INSERT INTO `files` (`id`, `title`, `description`, `date_created`, `date_updated`, `file`, `is_valid`, `type`) VALUES
	(1, 'Foodex2 Attributes (EN)', 'v12 CSV file', '2022-02-07 09:25:38.424840', '2022-02-07 09:25:38.424840', 'files/foodex_attributes_EN.csv', 1, 3),
	(2, 'Foodex2 Terms (EN)', 'v12 CSV file with pt columns', '2022-02-07 09:25:53.135908', '2022-05-02 12:05:54.487980', 'files/foodex_terms_EN.csv', 1, 3),
	(3, 'CC Native Application', 'Windows 64 application. Execute as administrator.', '2022-02-07 09:26:35.671859', '2022-02-11 14:40:25.110174', 'files/CCNativeApp.exe', 1, 2),
	(4, 'Chrome Extension', 'For manual installation.', '2022-02-07 09:27:04.309333', '2022-02-07 09:27:04.309333', 'files/chrome_extension.zip', 1, 2),
	(5, 'Manual', 'rev 2.7', '2022-02-07 10:02:22.914885', '2022-05-02 12:22:01.851339', 'files/users_manual.pdf', 1, 4),
	(6, 'Forms development notes', 'rev 1.4', '2022-02-14 10:46:59.680629', '2022-04-21 06:32:45.686814', 'files/forms_dev_notes.pdf', 1, 4);
```


### Query Table Example

```
INSERT INTO `query` (`id`, `name`, `query`, `date`, `status_id`, `description`) VALUES
	(1, 'A001', 'SELECT $name$, $address$, $country$, $phone$ from idrisk.target limit 10', '2021-05-27 19:14:48.127454', 5, NULL),
	(2, 'A002', 'SELECT $name$, $address$, $country$, $phone$ from idrisk.target where nif=#X# or nif=#Y#', '2021-10-21 12:26:11.343721', 6, NULL),
	(3, 'A003', 'SELECT $name$, $address$, $telephone$, $email$ FROM world.people WHERE fiscal_number = #fiscal#', '2021-10-04 07:45:47.000000', 5, NULL),
	(4, 'A005', 'SELECT $NAME$, $address$ FROM idrisk.target WHERE id = #X#', '2021-12-07 16:06:15.000000', 5, NULL),
	(5, 'A010', 'SELECT \r\n	$id$,\r\n	$designacao_social$,\r\n	$endereco$,\r\n	$designacao_estabelecimento$,\r\n	$endereco_sede_social$,\r\n	$codigo_postal$,\r\n	$localidade$,\r\n	$telefone$,\r\n	$fax$,\r\n	$telemovel$,\r\n	$email$,\r\n	$distrito$,\r\n	$concelho$,\r\n	$cae$ \r\nFROM \r\n	testes.estabelecimento \r\nWHERE \r\n	nif_nipc = #nif#', '2021-12-09 03:10:24.000000', 5, NULL);
```


## Notes and Documents



| Link | Description |
| ------ | ------ |
| [Dev Document](https://gitlab.com/arkhamlord666/forms/-/blob/master/media/files/forms_dev_notes.pdf) | Development document |
| [User's Manual](https://gitlab.com/arkhamlord666/forms/-/blob/master/media/files/users_manual.pdf) | Use's manual |
| ------ | ------ |
| [dev_notes](https://docs.google.com/spreadsheets/d/1vGtAhm7YxXVWHyIYrxnPj9vx_n9GWocKswIZAJKdyl8/edit?usp=sharing) | roadmap, TODO, bugs |
| [EAs](https://docs.google.com/spreadsheets/d/1M9wPL5e4km3ARaaxbRxLKjaMaoH-18uzLWDx4HoJghs/edit?usp=sharing) | Some details related with the Events/Actions system |
| [signals](https://docs.google.com/spreadsheets/d/1bPw0vpfPpsd3XMWVl6kVoWHcYo2vqMETD3jmf11JyxM/edit?usp=sharing) | Signals description, with the indication of the listeners and the dispatchers |
| [visibility_flags](https://docs.google.com/spreadsheets/d/1U0p8UJiKmRLNKj6XakN14UHgtOg6xIp8c8ba2m1tHEs/edit?usp=sharing) | Spreadsheet used to calculate the properties visibility hex per element |
| [validations](https://docs.google.com/spreadsheets/d/1GFaBA1l_m57rE9__GRErP0fiSPNdTC3h_3nUE5pxA7I/edit?usp=sharing) | Validation flags for each "transferable" element |
| [log](https://gitlab.com/arkhamlord666/forms/-/blob/master/log.txt) | Major changes between commits |



## Smart Card Signing

For now, it's only possible to electronically sign with the portuguese identification card.
Also, it's only possible to sign in windows and in chrome.
Both the extension and the native application can be found in: [files](https://gitlab.com/arkhamlord666/forms/-/tree/master/web/media/files).




## Roadmap W40+

| Task        | Priority        | Status |
| ------------- |:-------------:|:-------------:|
| PWA - offline | `HIGH` | *COMPLETED* (needs extensive testing) |
| signature with CC (PC) | `HIGH` | *COMPLETED* |
| signature with CC (mobile) | `HIGH` | In progress |
| list view header | `HIGH` | *COMPLETED* |
| brush tool (copy/past properties) | MEDIUM | *COMPLETED* |
| multiple: border properties| MEDIUM | *COMPLETED* |
| E/A - exec action if event already fullfilled at start    | MEDIUM ||
| table element | MEDIUM | *COMPLETED* |
| tables assets sync | MEDIUM | |
| FoodEx2 element | MEDIUM | *COMPLETED* |
| FoodEx2 validation | MEDIUM | |
| languages support | LOW | In progress |
| import/export doc | LOW ||
| email user if password change| LOW ||
| help pages     | LOW | In progress |
| background images/pdf: import from pdf | LOW ||
| background images/pdf: multiple images/docs selection | LOW ||
| richtext element | LOW ||
| undo | LOW ||
| cross property | LOW | *COMPLETED* |
| exec action if event already fullfilled | LOW ||
| chain events | LOW ||
| Rest API E/A | LOW ||
| Graphical interface for the E/A system | LOW ||

Check the [User's Manual](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/media/files/users_manual.pdf) or the [Dev Document](https://gitlab.com/arkhamlord666/forms/-/blob/master/web/media/files/forms_dev_notes.pdf) for more info.


## License
[MIT](https://choosealicense.com/licenses/mit/)
