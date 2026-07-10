from django.shortcuts import render
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from  rest_framework import status
from.models import LeaderboardEntry
from .models import Question
from .serializers import QuestionSerializer
from .serializers import LeaderboardSerializer
# Create your views here.

class QuestionListView(ListAPIView):
    serializer_class = QuestionSerializer
    def get_queryset(self):
        queryset = Question.objects.prefetch_related("answers")
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_name=category)
            return queryset
        
        
class LeaderboardView(APIView):
    def get(self, request):
        entries = LeaderboardEntry.objects.all()[:10]
        serializer = LeaderboardSerializer(entries, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = LeaderboardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    