from django.apps import AppConfig

class FormsmanagerConfig(AppConfig):
    name = 'formsmanager'


    def ready(self):
        from django_q.models import Schedule
        try:                
            Schedule.objects.get_or_create(name='remove-all-temp-forms',
                                        defaults={
                                            'func':'formsmanager.services.removeAllTempForms',
                                            'name':'remove-all-temp-forms',
                                            'schedule_type':'D',
                                            #'minutes':5,
                                            #'repeats':-1,
            })

            Schedule.objects.get_or_create(name='remove-all-empty-dirs-forms',
                                        defaults={
                                            'func':'formsmanager.services.removeEmptyAssetsDirs',
                                            'name':'remove-all-empty-dirs-forms',
                                            'schedule_type':'D',
                                            #'minutes':5,
                                            #'repeats':-1,
            })


        except Exception as e:
            print('Unable to schedule automatic tasks! ', e)

