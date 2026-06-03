from django.urls import path
from .views import *

urlpatterns = [
    path('income/add/', add_income),
    path('income/list/', income_list),

    path('expense/add/', add_expense),
    path('expense/list/', expense_list),

    path('dashboard/', dashboard),
    path('db/health/', db_health),
]