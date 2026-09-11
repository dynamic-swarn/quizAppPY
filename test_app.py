import json

from app import ADMIN_PASSWORD, ADMIN_SECRET, app, init_db


def test_admin_login_does_not_expose_password():
    with app.test_client() as client:
        init_db()
        response = client.post(
            '/api/auth/admin/login',
            json={'username': 'admin', 'password': ADMIN_PASSWORD, 'secret': ADMIN_SECRET}
        )
        assert response.status_code == 200, response.get_data(as_text=True)
        payload = response.get_json()
        assert 'password' not in payload['user']


def test_admin_can_update_profile_and_delete_student():
    with app.test_client() as client:
        init_db()
        signup = client.post(
            '/api/auth/student/signup',
            json={
                'name': 'Alice Student',
                'username': 'alice',
                'email': 'alice@example.com',
                'password': 'student123'
            }
        )
        student_id = signup.get_json()['user']['id']

        admin = client.post(
            '/api/auth/admin/login',
            json={'username': 'admin', 'password': ADMIN_PASSWORD, 'secret': ADMIN_SECRET}
        ).get_json()['user']

        update = client.put(
            f"/api/users/{admin['id']}",
            json={'name': 'Updated Admin', 'username': 'admin2'}
        )
        assert update.status_code == 200, update.get_data(as_text=True)
        updated = update.get_json()['user']
        assert updated['name'] == 'Updated Admin'
        assert 'password' not in updated

        delete_response = client.delete(f'/api/users/{student_id}')
        assert delete_response.status_code == 200, delete_response.get_data(as_text=True)
        users = client.get('/api/users').get_json()
        assert all(user['id'] != student_id for user in users)
