from rest_framework import serializers
from operations.models import Operation, OperationData, OperationAsset
from designer.serializers import FormSimplex3Serializer


class OperationSerializer(serializers.ModelSerializer):
    status_name = serializers.ReadOnlyField(source='status.name', read_only=True)
    form_name = serializers.ReadOnlyField(source='form.name', read_only=True)
    author_name = serializers.ReadOnlyField(source='author.username', read_only=True)
    updated_by_name = serializers.ReadOnlyField(source='updated_by.username', read_only=True)
    class Meta:
        model = Operation
        fields = ['id', 'name', 'description', 'form','form_name','date_creation','date_updated','author','author_name','updated_by','updated_by_name','status_name']


class OperationIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operation
        fields = ['id']

class OperationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationData
        fields = ['id', 'operation', 'data']


class OperationFormDataSerializer(serializers.Serializer):
    form = FormSimplex3Serializer(read_only=True)
    data = OperationDataSerializer(read_only=True)


class FullOperationDataSerializer(serializers.Serializer):
    operation_description = OperationSerializer(read_only=True)
    operation_data = OperationDataSerializer(read_only=True)


class OperationAssetSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    class Meta:
        model = OperationAsset
        fields = ['id', 'name', 'asset', 'type','type_name', 'is_annex', 'date','operation']