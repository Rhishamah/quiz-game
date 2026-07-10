from django.contrib import admin
from .models import Category, Question, Answer, LeaderboardEntry
# Register your models here.
admin.site.register(Category)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(LeaderboardEntry)
