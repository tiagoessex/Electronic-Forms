from django.urls import path

from rest import views


app_name = "rest"
urlpatterns = [
    path('api/api-token-auth/', views.CustomAuthToken.as_view(), name='api-tokn-auth'),

    # GET
    path('api/list_operations/', views.ListOperations.as_view(), name="list_operations"),
    path('api/list_non_completed_operations/', views.ListNonCompletedOperations.as_view(), name="list_non_completed_operations"),
    path('api/get_operation/<int:pk>/', views.GetOperation.as_view(), name="get_operation"),
    path('api/get_operation_data/<int:pk>/', views.GetOperationData.as_view(), name="get_operation_data"),
    path('api/get_operation_form_data/<int:pk>/', views.GetOperationFormData.as_view(), name="get_operation_form_data"),
    path('api/validate_operation_inputs/<int:pk>/', views.ValidateOperationInputs.as_view(), name="validate_operation_inputs"),
    path('api/get_operation_data_val/<int:pk>/', views.GetFormOperationDataValidations.as_view(), name="get_operation_data_val"),
    path('api/list_operation_assets/<int:pk>/', views.ListOperationAssets.as_view(), name="list_operation_assets"),

    # POST
    path('api/delete_operation/', views.DeleteOperation.as_view(), name="delete_operation"),
    path('api/set_operation_status/', views.SetOperationStatus.as_view(), name="set_operation_status"),

]