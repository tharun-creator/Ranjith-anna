import pytest
import datetime
import uuid
from app.api.invoices import get_duplicates_map
from app.models import Invoice

def test_duplicate_by_number_and_vendor():
    inv_id1 = uuid.uuid4()
    inv_id2 = uuid.uuid4()
    
    inv1 = Invoice(
        id=inv_id1,
        vendor_name="Acme Corp",
        invoice_number="INV-100",
        total_amount=1500.0,
        invoice_date=datetime.date(2026, 1, 1),
        created_at=datetime.datetime(2026, 1, 1, 12, 0, 0)
    )
    
    inv2 = Invoice(
        id=inv_id2,
        vendor_name="Acme Corp",
        invoice_number="INV-100",
        total_amount=3000.0,  # Different amount, but same vendor & number!
        invoice_date=datetime.date(2026, 1, 2),
        created_at=datetime.datetime(2026, 1, 2, 12, 0, 0)
    )
    
    dup_map = get_duplicates_map([inv1, inv2])
    
    assert dup_map[str(inv_id1)]["is_duplicate"] is False
    assert dup_map[str(inv_id2)]["is_duplicate"] is True
    assert dup_map[str(inv_id2)]["original_id"] == str(inv_id1)

def test_duplicate_by_vendor_amount_and_date():
    inv_id1 = uuid.uuid4()
    inv_id2 = uuid.uuid4()
    
    inv1 = Invoice(
        id=inv_id1,
        vendor_name="Acme Corp",
        invoice_number="INV-101",
        total_amount=1500.0,
        invoice_date=datetime.date(2026, 1, 1),
        created_at=datetime.datetime(2026, 1, 1, 12, 0, 0)
    )
    
    inv2 = Invoice(
        id=inv_id2,
        vendor_name="Acme Corp",
        invoice_number="INV-202",  # Different number, but same vendor, amount, date!
        total_amount=1500.0,
        invoice_date=datetime.date(2026, 1, 1),
        created_at=datetime.datetime(2026, 1, 2, 12, 0, 0)
    )
    
    dup_map = get_duplicates_map([inv1, inv2])
    
    assert dup_map[str(inv_id1)]["is_duplicate"] is False
    assert dup_map[str(inv_id2)]["is_duplicate"] is True
    assert dup_map[str(inv_id2)]["original_id"] == str(inv_id1)
