import pytest
from app.services.ledger_classifier import LedgerClassifier

def test_google_ads_mapping():
    result = LedgerClassifier.classify_by_keywords("Google Ads Vendor", "Advertising campaign charge")
    assert result is not None
    assert result["ledger_code"] == "ASP-30"
    assert result["ledger_name"] == "Marketing & Branding Expenses"
    assert result["ledger_category"] == "Expense"

def test_software_saas_mapping():
    result = LedgerClassifier.classify_by_keywords("ChatGPT", "Monthly OpenAI SaaS subscription")
    assert result is not None
    assert result["ledger_code"] == "ASP-28"
    assert result["ledger_name"] == "Softwares, Laptop Rental"

def test_legal_consultant_mapping():
    result = LedgerClassifier.classify_by_keywords("Top Legal Partners", "Corporate legal consultation fees")
    assert result is not None
    assert result["ledger_code"] == "ASP-33"
    assert result["ledger_category"] == "Expense"

def test_travel_mapping():
    result = LedgerClassifier.classify_by_keywords("Uber India", "Flight cab conveyance receipt")
    assert result is not None
    assert result["ledger_code"] == "ASP-59"

def test_consulting_income_mapping():
    result = LedgerClassifier.classify_by_keywords("Acme Client", "Management consulting services rendered")
    assert result is not None
    assert result["ledger_code"] == "ARC-02"
    assert result["ledger_category"] == "Income"

def test_uncategorized_mapping():
    result = LedgerClassifier.classify_by_keywords("Unknown Entity", "Random unclassified description")
    assert result is None
