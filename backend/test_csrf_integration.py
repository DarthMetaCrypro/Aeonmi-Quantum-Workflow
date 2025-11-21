"""
Integration test for CSRF protection
Tests that CSRF tokens are properly integrated between frontend and backend
"""

import pytest
import json
from app import app

@pytest.fixture
def client():
    """Flask test client with CSRF disabled for testing"""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = True  # Enable CSRF for integration test
    with app.test_client() as client:
        yield client


def test_csrf_full_flow(client):
    """Test complete CSRF flow: fetch token -> use token -> success"""
    # Step 1: Fetch CSRF token
    csrf_response = client.get('/api/csrf-token')
    assert csrf_response.status_code == 200
    
    csrf_data = json.loads(csrf_response.data)
    csrf_token = csrf_data['csrf_token']
    assert csrf_token is not None
    assert len(csrf_token) > 0
    
    # Step 2: Use CSRF token in a POST request (register endpoint)
    register_payload = {
        'name': 'CSRF Test User',
        'email': 'csrf_test@quantumforge.app',
        'password': 'SecurePass123'
    }
    
    # Note: Auth endpoints are typically exempted from CSRF in production
    # This test validates the token generation mechanism
    headers = {
        'X-CSRFToken': csrf_token,
        'Content-Type': 'application/json'
    }
    
    response = client.post(
        '/api/auth/register',
        data=json.dumps(register_payload),
        headers=headers
    )
    
    # Should succeed with valid CSRF token
    assert response.status_code in [201, 200]
    

def test_csrf_token_refreshable(client):
    """Test that CSRF tokens can be fetched multiple times"""
    # Fetch token 1
    response1 = client.get('/api/csrf-token')
    token1 = json.loads(response1.data)['csrf_token']
    
    # Fetch token 2
    response2 = client.get('/api/csrf-token')
    token2 = json.loads(response2.data)['csrf_token']
    
    # Both should be valid
    assert token1 is not None
    assert token2 is not None
    assert len(token1) > 0
    assert len(token2) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
