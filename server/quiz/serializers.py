from rest_framework import serializers
from .models import Question, Answer, LeaderboardEntry

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    category = serializers.StringRelatedField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'category', 'answers']

class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'player_name', 'score', 'total_questions', 'created_at']
        