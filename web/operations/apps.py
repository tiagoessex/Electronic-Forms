from django.apps import AppConfig


#class OperationsConfig(AppConfig):
#    name = 'operations'


class OperationsConfig(AppConfig):
    name = 'operations'


    def ready(self):
        from django_q.models import Schedule
        try:                
            Schedule.objects.get_or_create(name='remove-all-empty-dirs-operations',
                                        defaults={
                                            'func':'operations.services.removeEmptyAssetsDirs',
                                            'name':'remove-all-empty-dirs-operations',
                                            'schedule_type':'D',
            })


        except Exception as e:
            print('Unable to schedule automatic tasks! ', e)

