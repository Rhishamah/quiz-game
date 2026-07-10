from django.urls import path
from .views import QuestionListView, LeaderboardView

urlpatterns  = [
    path('questions/', QuestionListView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),

]