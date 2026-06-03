from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .mongodb import expense_collection, get_db_source, income_collection

import json
from datetime import datetime


def _parse_transaction_payload(request):
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Malformed JSON payload: {exc}")

    name = str(payload.get("name", "")).strip()
    purpose = str(payload.get("purpose", "")).strip()
    remarks = str(payload.get("remarks", "")).strip()
    date = str(payload.get("date", "")).strip()
    amount = payload.get("amount")

    if not name:
        raise ValueError("Transaction name is required.")
    if amount in (None, ""):
        raise ValueError("Transaction amount is required.")

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        raise ValueError("Transaction amount must be a number.")

    if date:
        try:
            date = datetime.strptime(date, "%Y-%m-%d").strftime("%d-%m-%Y")
        except ValueError:
            raise ValueError("Transaction date must be a valid date.")
    else:
        date = datetime.utcnow().strftime("%d-%m-%Y")

    return {
        "date": date,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "name": name,
        "amount": amount,
        "purpose": purpose,
        "remarks": remarks,
    }


# ==========================
# ADD INCOME
# ==========================
@csrf_exempt
@require_POST
def add_income(request):
    if income_collection is None:
        return JsonResponse({"status": False, "message": "Database unavailable"}, status=503)

    try:
        income = _parse_transaction_payload(request)
        income_collection.insert_one(income)
        return JsonResponse({"status": True, "message": "Income Added Successfully"})
    except ValueError as exc:
        return JsonResponse({"status": False, "message": "Invalid income data", "error": str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({"status": False, "message": "Unable to save income", "error": str(exc)}, status=500)


# ==========================
# INCOME LIST
# ==========================
def income_list(request):

    incomes = []

    if income_collection is None:
        return JsonResponse({"status": False, "message": "Database unavailable"}, status=503)

    for item in income_collection.find().sort("_id", -1):

        incomes.append({
            "id": str(item["_id"]),
            "date": item["date"],
            "name": item["name"],
            "amount": item["amount"],
            "purpose": item["purpose"],
            "remarks": item["remarks"]
        })

    return JsonResponse(incomes, safe=False)


# ==========================
# ADD EXPENSE
# ==========================
@csrf_exempt
@require_POST
def add_expense(request):
    if expense_collection is None:
        return JsonResponse({"status": False, "message": "Database unavailable"}, status=503)

    try:
        expense = _parse_transaction_payload(request)
        expense_collection.insert_one(expense)
        return JsonResponse({"status": True, "message": "Expense Added Successfully"})
    except ValueError as exc:
        return JsonResponse({"status": False, "message": "Invalid expense data", "error": str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({"status": False, "message": "Unable to save expense", "error": str(exc)}, status=500)


# ==========================
# EXPENSE LIST
# ==========================
def expense_list(request):

    expenses = []

    if expense_collection is None:
        return JsonResponse({"status": False, "message": "Database unavailable"}, status=503)

    for item in expense_collection.find().sort("_id", -1):

        expenses.append({
            "id": str(item["_id"]),
            "date": item["date"],
            "name": item["name"],
            "amount": item["amount"],
            "purpose": item["purpose"],
            "remarks": item["remarks"]
        })

    return JsonResponse(expenses, safe=False)


# ==========================
# DASHBOARD
# ==========================
def dashboard(request):

    if income_collection is None or expense_collection is None:
        return JsonResponse({"status": False, "message": "Database unavailable"}, status=503)

    total_income = 0
    total_expense = 0

    for income in income_collection.find():
        total_income += float(income["amount"])

    for expense in expense_collection.find():
        total_expense += float(expense["amount"])

    balance = total_income - total_expense

    return JsonResponse({
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    })


def db_health(request):
    """Simple health endpoint returning DB connectivity and backend source."""
    if income_collection is None or expense_collection is None:
        return JsonResponse({"status": False, "message": "DB unavailable"}, status=503)

    source = get_db_source() or "unknown"
    try:
        income_collection.database.client.admin.command("ping")
        return JsonResponse({"status": True, "db_source": source})
    except Exception as exc:
        return JsonResponse({"status": False, "message": "DB ping failed", "db_source": source, "error": str(exc)}, status=503)
