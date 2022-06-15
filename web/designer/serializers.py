from rest_framework import serializers
from designer.models import Form, FormAsset, AssetType, Query


class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = '__all__'

class FormSimplexSerializer(serializers.ModelSerializer):
    status_name = serializers.ReadOnlyField(source='status.name', read_only=True)
    class Meta:
        model = Form
        fields = ['id', 'name', 'description', 'status_name']

class FormSimplex2Serializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username', read_only=True)
    locked_by_name = serializers.ReadOnlyField(source='locked_by.username', read_only=True)
    updated_by_name = serializers.ReadOnlyField(source='updated_by.username', read_only=True)
    disabled_by_name = serializers.ReadOnlyField(source='disabled_by.username', read_only=True)
    status_name = serializers.ReadOnlyField(source='status.name', read_only=True)
    class Meta:
        model = Form
        fields = ['id', 'name', 'description','status_name','author_name','locked_by_name','updated_by_name','disabled_by_name','date_created','date_updated','date_locked','date_disabled']


class FormSimplex3Serializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = ['id', 'name', 'form']

class FormAssetSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    class Meta:
        model = FormAsset
        fields = ['id', 'name', 'asset', 'type','type_name']



class AssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetType
        fields = '__all__'

class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'name', 'query']