from django.urls import path

from operations import views

app_name = "operations"
urlpatterns = [
    path('', views.operations, name='operations'),

    path('api/list_in_use_forms/', views.list_in_use_forms, name="list_in_use_forms"),
    path('api/exec_query/', views.exec_query, name="exec_query"),
    path('api/new_operation/', views.new_operation, name="new_operation"),
    path('api/delete_operation/', views.delete_operation, name="delete_operation"),
    path('api/update_operation/', views.update_operation, name="update_operation"),
    path('api/new_operation_complete/', views.new_operation_complete, name="new_operation_complete"),
    path('api/get_operation/<int:pk>/', views.get_operation, name="get_operation"),
    path('api/list_operations/<str:stats>/', views.list_operations, name="list_operations"),
    path('api/list_all_operations/', views.list_all_operations, name="list_all_operations"),
    path('api/list_non_completed_operations/', views.list_non_completed_operations, name="list_non_completed_operations"),
    path('api/list_all_non_completed_operations/', views.list_all_non_completed_operations, name="list_all_non_completed_operations"),
    path('api/get_operation_data/<int:pk>/', views.get_operation_data, name="get_operation_data"),
    path('api/set_operation_status/', views.set_operation_status, name="set_operation_status"),
    path('api/get_operation_form_data/<int:pk>/', views.get_operation_form_data, name="get_operation_form_data"),
    path('api/upload_operation_asset/', views.upload_operation_asset, name='upload_operation_asset'),
    path('api/upload_operation_asset_complete/', views.upload_operation_asset_complete, name='upload_operation_asset_complete'),    
    path('api/remove_operation_asset/', views.remove_operation_asset, name="remove_operation_asset"),
    path('api/validate_operation_inputs/<int:pk>/', views.validate_operation_inputs, name="validate_operation_inputs"),
    path('api/get_op_form_data/<int:pk>/', views.get_op_form_data, name="get_op_form_data"),
    path('api/list_operation_assets/<int:pk>/', views.list_operation_assets, name="list_operation_assets"),    
    path('api/list_operation_assets/<int:pk>/<str:name>/', views.list_operation_assets, name="list_operation_assets"),
    path('api/list_operation_annexes/<int:pk>/', views.list_operation_annexes, name="list_operation_annexes"),
    path('api/download_asset/<int:pk>/', views.download_asset, name="download_asset"),
    path('api/clean_operation_assets/', views.clean_operation_assets, name="clean_operation_assets"),
    path('api/is_operation_signed/<int:pk>/', views.is_operation_signed, name="is_operation_signed"),

]
