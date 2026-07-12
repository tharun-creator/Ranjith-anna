import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ai_extraction_service import AIExtractionService

@pytest.mark.asyncio
@patch('app.services.ai_extraction_service.genai.GenerativeModel')
async def test_gemini_primary_success(mock_genai_model):
    # Mock Gemini model to succeed on first call
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"vendor_name": "Gemini Vendor", "total_amount": 100.0}'
    mock_instance.generate_content.return_value = mock_response
    mock_genai_model.return_value = mock_instance

    service = AIExtractionService()
    result = await service.extract_invoice_data(pdf_bytes=b"dummy_pdf_bytes")

    assert result["vendor_name"] == "Gemini Vendor"
    mock_instance.generate_content.assert_called_once()

@pytest.mark.asyncio
@patch('app.services.ai_extraction_service.genai.GenerativeModel')
async def test_gemini_failure_fallback_to_openai(mock_genai_model):
    # Mock Gemini model to fail
    mock_gemini_instance = MagicMock()
    mock_gemini_instance.generate_content.side_effect = Exception("Gemini Error")
    mock_genai_model.return_value = mock_gemini_instance

    service = AIExtractionService()
    
    # Mock OpenAI client
    mock_openai_client = MagicMock()
    mock_openai_completions = AsyncMock()
    mock_openai_response = MagicMock()
    
    # Mock chat completion response
    mock_choice = MagicMock()
    mock_choice.message.content = '{"vendor_name": "OpenAI Vendor", "total_amount": 200.0}'
    mock_openai_response.choices = [mock_choice]
    mock_openai_completions.create.return_value = mock_openai_response
    mock_openai_client.chat.completions = mock_openai_completions
    
    service.openai_client = mock_openai_client

    result = await service.extract_invoice_data(pdf_bytes=b"dummy_pdf_bytes")

    assert result["vendor_name"] == "OpenAI Vendor"
    mock_openai_completions.create.assert_called_once()
