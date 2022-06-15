from django.urls import path
from designer import views

app_name = "designer"
urlpatterns = [
    path('', views.designer, name='designer'),
    path('<int:form_id>/', views.designerID, name='designerID'),

    
    path('api/list_databases/', views.list_databases, name='list_databases'),
    path('api/db_tables/', views.db_tables, name='db_tables'),
    path('api/db_table_columns/', views.db_table_columns, name='db_table_columns'),

    path('api/change/', views.change, name="change"),
    path('api/check_name/', views.check_name, name="check_name"),
    path('api/new_form/', views.new_form, name='new_form'), 
    path('api/save/', views.save, name="save"),
    path('api/editable_forms/', views.editable_forms, name="editable_forms"),    
    path('api/upload_form_asset/', views.upload_form_asset, name='upload_form_asset'),
    path('api/get_form/<int:pk>/', views.get_form, name="get_form"),
    path('api/get_editable_form/<int:pk>/', views.get_editable_form, name="get_editable_form"),
    path('api/list_form_assets/<int:pk>/', views.list_form_assets, name="list_form_assets"),
    path('api/list_form_assets/<int:pk>/<str:name>/', views.list_form_assets, name="list_form_assets"),
    path('api/form_content/<int:pk>/', views.form_content, name="form_content"),
    path('api/delete_temp/', views.delete_temp, name="delete_temp"),
    path('api/remove_form_asset/', views.remove_form_asset, name="remove_form_asset"),
    path('api/download/<int:pk>/', views.download, name="download"),

    # tables
    path('api/get_table/<int:form>/<str:table>/', views.get_table, name="get_table"),
    path('api/list_table_columns/<int:form>/<str:table>/', views.list_table_columns, name="list_table_columns"),
    path('api/get_table_column/<int:form>/<str:table>/<str:column>/', views.get_table_column, name="get_table_column"),

    # databases
    path('api/list_dbs/', views.list_dbs, name="list_dbs"),
    path('api/list_db_tables/<str:db>/', views.list_db_tables, name="list_db_tables"),
    path('api/list_db_table_cols/<str:db>/<str:table>/', views.list_db_table_cols, name="list_db_table_cols"),
    path('api/get_db_table_col/<str:db>/<str:table>/<str:column>/', views.get_db_table_col, name="get_db_table_col"),
    path('api/get_db_table_col_unique/<str:db>/<str:table>/<str:column>/', views.get_db_table_col_unique, name="get_db_table_col_unique"),

    # queries
    path('api/list_queries/', views.list_queries, name="list_queries"),

]