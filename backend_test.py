#!/usr/bin/env python3
"""
Backend API Testing for DM Sports AI Generator
Tests all API endpoints with comprehensive coverage
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class DMSportsAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.test_user_id = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_product_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_detail = response.json().get('detail', 'No detail')
                    details += f" - {error_detail}"
                except:
                    details += f" - {response.text[:100]}"

            return self.log_test(name, success, details), response

        except requests.exceptions.RequestException as e:
            return self.log_test(name, False, f"Connection Error: {str(e)}"), None

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET", 
            "/health",
            200
        )
        
        if success and response:
            try:
                data = response.json()
                if data.get('status') == 'healthy':
                    print(f"   Service: {data.get('service', 'Unknown')}")
                    return True
            except:
                pass
        return False

    def test_get_brands(self):
        """Test brands endpoint"""
        success, response = self.run_test(
            "Get Brands",
            "GET",
            "/brands", 
            200
        )
        
        if success and response:
            try:
                brands = response.json()
                if isinstance(brands, list) and len(brands) > 0:
                    print(f"   Found {len(brands)} brands: {brands[:3]}...")
                    return True
            except:
                pass
        return False

    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            "username": self.test_user_id,
            "email": f"{self.test_user_id}@test.com",
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/register",
            200,
            data=user_data
        )
        
        if success and response:
            try:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.token = data['access_token']
                    print(f"   User created: {data['user']['username']}")
                    return True
            except:
                pass
        return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "username": self.test_user_id,
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/login",
            200,
            data=login_data
        )
        
        if success and response:
            try:
                data = response.json()
                if 'access_token' in data:
                    self.token = data['access_token']
                    print(f"   Login successful for: {data['user']['username']}")
                    return True
            except:
                pass
        return False

    def test_create_product(self):
        """Test product creation"""
        product_data = {
            "name": "Nike Air Max Test",
            "brand": "Nike",
            "category": "chaussures-running",
            "gender": "homme",
            "price": 129.99,
            "old_price": 149.99,
            "sku": f"TEST-{uuid.uuid4().hex[:8].upper()}",
            "description": "Chaussure de test pour l'API",
            "short_description": "Test product for API validation",
            "material": "Mesh respirant",
            "season": "Toutes saisons",
            "features": ["Technologie Air Max", "Semelle en caoutchouc", "Design moderne"],
            "sizes": ["42", "43", "44"],
            "colors": ["Noir", "Blanc", "Rouge"],
            "images": []
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "/products",
            200,
            data=product_data
        )
        
        if success and response:
            try:
                data = response.json()
                if 'id' in data and 'generated_content' in data:
                    self.created_product_id = data['id']
                    print(f"   Product created with ID: {self.created_product_id}")
                    print(f"   Generated title: {data['generated_content'].get('title', 'N/A')}")
                    return True
            except:
                pass
        return False

    def test_get_products(self):
        """Test getting user products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "/products",
            200
        )
        
        if success and response:
            try:
                products = response.json()
                if isinstance(products, list):
                    print(f"   Found {len(products)} products")
                    return True
            except:
                pass
        return False

    def test_get_single_product(self):
        """Test getting a single product"""
        if not self.created_product_id:
            return self.log_test("Get Single Product", False, "No product ID available")
        
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"/products/{self.created_product_id}",
            200
        )
        
        if success and response:
            try:
                product = response.json()
                if 'id' in product and product['id'] == self.created_product_id:
                    print(f"   Retrieved product: {product.get('name', 'Unknown')}")
                    return True
            except:
                pass
        return False

    def test_update_product(self):
        """Test updating a product"""
        if not self.created_product_id:
            return self.log_test("Update Product", False, "No product ID available")
        
        update_data = {
            "name": "Nike Air Max Test Updated",
            "price": 119.99,
            "features": ["Updated feature 1", "Updated feature 2"]
        }
        
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"/products/{self.created_product_id}",
            200,
            data=update_data
        )
        
        if success and response:
            try:
                product = response.json()
                if product.get('name') == update_data['name']:
                    print(f"   Product updated: {product['name']}")
                    return True
            except:
                pass
        return False

    def test_generate_content(self):
        """Test content generation endpoint"""
        content_data = {
            "name": "Test Product",
            "brand": "Nike",
            "category": "chaussures",
            "gender": "homme",
            "material": "Cuir",
            "features": ["Feature 1", "Feature 2"]
        }
        
        success, response = self.run_test(
            "Generate Content",
            "POST",
            "/generate-content",
            200,
            data=content_data
        )
        
        if success and response:
            try:
                content = response.json()
                if 'title' in content and 'description' in content:
                    print(f"   Generated title: {content['title']}")
                    return True
            except:
                pass
        return False

    def test_delete_product(self):
        """Test product deletion"""
        if not self.created_product_id:
            return self.log_test("Delete Product", False, "No product ID available")
        
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"/products/{self.created_product_id}",
            200
        )
        
        if success and response:
            try:
                result = response.json()
                if 'message' in result:
                    print(f"   {result['message']}")
                    return True
            except:
                pass
        return False

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "/products",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting DM Sports API Tests")
        print("=" * 50)
        
        # Basic connectivity tests
        print("\n📡 Basic Connectivity Tests")
        self.test_health_check()
        self.test_get_brands()
        
        # Authentication tests
        print("\n🔐 Authentication Tests")
        self.test_user_registration()
        self.test_user_login()
        self.test_unauthorized_access()
        
        # Product management tests
        print("\n📦 Product Management Tests")
        self.test_create_product()
        self.test_get_products()
        self.test_get_single_product()
        self.test_update_product()
        self.test_generate_content()
        self.test_delete_product()
        
        # Results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! API is working correctly.")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed.")
            return 1

def main():
    """Main test runner"""
    tester = DMSportsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())