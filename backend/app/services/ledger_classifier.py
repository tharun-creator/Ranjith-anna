import re
from typing import Dict, Any, Optional

class LedgerClassifier:
    KEYWORD_MAPPINGS = [
        {
            "keywords": ["google ads", "facebook ads", "linkedin ads", "advertising", "marketing", "promotion"],
            "ledger_code": "ASP-30",
            "ledger_name": "Marketing & Branding Expenses",
            "ledger_category": "Expense",
            "ledger_group": "ASP"
        },
        {
            "keywords": ["microsoft 365", "google workspace", "chatgpt", "claude", "software", "rental", "saas", "aws", "gcp", "azure"],
            "ledger_code": "ASP-28",
            "ledger_name": "Softwares, Laptop Rental",
            "ledger_category": "Expense",
            "ledger_group": "ASP"
        },
        {
            "keywords": ["lawyer", "legal", "consultant", "compliance", "audit", "counsel"],
            "ledger_code": "ASP-33",
            "ledger_name": "Professional & Legal Expense",
            "ledger_category": "Expense",
            "ledger_group": "ASP"
        },
        {
            "keywords": ["flight", "hotel", "uber", "travel", "taxi", "conveyance", "train", "cab"],
            "ledger_code": "ASP-59",
            "ledger_name": "Travelling & Conveyance",
            "ledger_category": "Expense",
            "ledger_group": "ASP"
        },
        {
            "keywords": ["office rent", "workspace rent", "coworking", "rent"],
            "ledger_code": "SISU-61",
            "ledger_name": "Rent for Office Space",
            "ledger_category": "Expense",
            "ledger_group": "SISU"
        },
        {
            "keywords": ["consulting service", "consultancy", "management consulting"],
            "ledger_code": "ARC-02",
            "ledger_name": "Management Consulting Service",
            "ledger_category": "Income",
            "ledger_group": "ARC"
        },
        {
            "keywords": ["subscription", "membership", "recurring customer payment"],
            "ledger_code": "SUBSCRIPTION",
            "ledger_name": "Subscription Income",
            "ledger_category": "Income",
            "ledger_group": "SUBSCRIPTION"
        }
    ]

    @classmethod
    def classify_by_keywords(cls, vendor_name: str, notes: str = "", text_content: str = "") -> Optional[Dict[str, Any]]:
        search_str = f"{vendor_name} {notes} {text_content}".lower()
        for mapping in cls.KEYWORD_MAPPINGS:
            if any(kw in search_str for kw in mapping["keywords"]):
                return {
                    "ledger_code": mapping["ledger_code"],
                    "ledger_name": mapping["ledger_name"],
                    "ledger_category": mapping["ledger_category"],
                    "ledger_group": mapping["ledger_group"],
                    "ledger_confidence": 85.0
                }
        return None
