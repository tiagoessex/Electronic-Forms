from django import template

register = template.Library() 


@register.filter(name='has_group') 
def has_group(user, group_name):
    """Filter to be used in templates, to check if a user is in a specific group.
    Ex: {% if request.user|has_group:"manager" %}"""
    return user.groups.filter(name=group_name).exists() 


