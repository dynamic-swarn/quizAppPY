import json
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_file

app = Flask(__name__, static_folder='.', static_url_path='')
DB_PATH = Path(__file__).with_name('quiz_app.db')
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'Admin@1234'
ADMIN_SECRET = 'Admin@1234'


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_user_columns(conn):
    cols = {row['name'] for row in conn.execute('PRAGMA table_info(users)').fetchall()}
    if 'branch' not in cols:
        conn.execute('ALTER TABLE users ADD COLUMN branch TEXT')
    if 'roll_number' not in cols:
        conn.execute('ALTER TABLE users ADD COLUMN roll_number TEXT')


def init_db():
    conn = get_db_connection()
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            branch TEXT,
            roll_number TEXT,
            created_at TEXT NOT NULL
        )
        '''
    )
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            time_limit INTEGER NOT NULL,
            passing_percentage INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            questions TEXT NOT NULL
        )
        '''
    )
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            quiz_title TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            percentage INTEGER NOT NULL,
            date TEXT NOT NULL,
            time_taken TEXT NOT NULL,
            answers TEXT NOT NULL
        )
        '''
    )
    conn.execute('DELETE FROM attempts')
    conn.execute('DELETE FROM quizzes')
    conn.execute('DELETE FROM users')
    ensure_user_columns(conn)
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            time_limit INTEGER NOT NULL,
            passing_percentage INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            questions TEXT NOT NULL
        )
        '''
    )
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            quiz_title TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            percentage INTEGER NOT NULL,
            date TEXT NOT NULL,
            time_taken TEXT NOT NULL,
            answers TEXT NOT NULL
        )
        '''
    )
    conn.commit()
    seed_demo_data(conn)
    conn.close()


def ensure_admin_account(conn):
    admin_rows = conn.execute('SELECT * FROM users WHERE role = ? ORDER BY id', ('admin',)).fetchall()

    if not admin_rows:
        now = datetime.now().strftime('%Y-%m-%d')
        conn.execute(
            'INSERT INTO users (name, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            ('Admin User', ADMIN_USERNAME, 'admin@quizmaster.com', ADMIN_PASSWORD, 'admin', now)
        )
        return

    primary_admin = admin_rows[0]
    conn.execute(
        'UPDATE users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?',
        ('Admin User', ADMIN_USERNAME, 'admin@quizmaster.com', ADMIN_PASSWORD, primary_admin['id'])
    )

    for extra in admin_rows[1:]:
        conn.execute('DELETE FROM users WHERE id = ?', (extra['id'],))


def seed_demo_data(conn):
    user_count = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
    quiz_count = conn.execute('SELECT COUNT(*) FROM quizzes').fetchone()[0]

    if user_count == 0:
        now = datetime.now().strftime('%Y-%m-%d')
        conn.execute(
            'INSERT INTO users (name, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            ('Admin User', ADMIN_USERNAME, 'admin@quizmaster.com', ADMIN_PASSWORD, 'admin', now)
        )
        conn.execute(
            'INSERT INTO users (name, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            ('Demo Student', 'student', 'student@example.com', 'student123', 'student', now)
        )
    else:
        ensure_admin_account(conn)

    if quiz_count == 0:
        demo_quizzes = [
            {
                'id': 1,
                'title': 'HTML & CSS Basics',
                'description': 'Test your knowledge of HTML and CSS fundamentals.',
                'category': 'Web Development',
                'difficulty': 'Easy',
                'timeLimit': 10,
                'passingPercentage': 60,
                'createdAt': '2025-02-10',
                'questions': [
                    {'id': 1, 'question': 'What does HTML stand for?', 'options': ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Markup Language'], 'answer': 0, 'explanation': 'HTML stands for Hyper Text Markup Language.'},
                    {'id': 2, 'question': 'Which CSS property controls the text size?', 'options': ['font-style', 'text-size', 'font-size', 'text-style'], 'answer': 2, 'explanation': 'font-size controls the size of the text.'},
                    {'id': 3, 'question': 'What is the correct HTML element for the largest heading?', 'options': ['<h6>', '<heading>', '<h1>', '<head>'], 'answer': 2, 'explanation': '<h1> defines the largest heading.'},
                    {'id': 4, 'question': 'Which CSS property is used to change the background color?', 'options': ['color', 'bgcolor', 'background-color', 'background'], 'answer': 2, 'explanation': 'background-color sets the background color.'},
                    {'id': 5, 'question': 'What does CSS stand for?', 'options': ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], 'answer': 1, 'explanation': 'CSS stands for Cascading Style Sheets.'}
                ]
            },
            {
                'id': 2,
                'title': 'JavaScript Fundamentals',
                'description': 'Test your knowledge of JavaScript basics.',
                'category': 'Programming',
                'difficulty': 'Medium',
                'timeLimit': 15,
                'passingPercentage': 60,
                'createdAt': '2025-02-15',
                'questions': [
                    {'id': 1, 'question': 'Which keyword is used to declare a constant in JavaScript?', 'options': ['var', 'let', 'const', 'static'], 'answer': 2, 'explanation': 'const is used to declare a constant variable.'},
                    {'id': 2, 'question': 'What is the correct way to write a JavaScript array?', 'options': ['var colors = "red", "green", "blue"', 'var colors = ["red", "green", "blue"]', 'var colors = (1:"red", 2:"green", 3:"blue")', 'var colors = 1 = ("red"), 2 = ("green")'], 'answer': 1, 'explanation': 'Arrays are written with square brackets.'},
                    {'id': 3, 'question': 'How do you write "Hello World" in an alert box?', 'options': ['msg("Hello World")', 'alert("Hello World")', 'alertBox("Hello World")', 'msgBox("Hello World")'], 'answer': 1, 'explanation': 'alert() displays an alert box.'},
                    {'id': 4, 'question': 'What is the result of 2 + "2" in JavaScript?', 'options': ['4', '22', 'NaN', 'undefined'], 'answer': 1, 'explanation': 'JavaScript concatenates when one operand is a string.'},
                    {'id': 5, 'question': 'Which operator is used to assign a value to a variable?', 'options': ['*', '-', '=', 'x'], 'answer': 2, 'explanation': 'The = operator assigns values.'}
                ]
            }
        ]

        for item in demo_quizzes:
            conn.execute(
                'INSERT INTO quizzes (title, description, category, difficulty, time_limit, passing_percentage, created_at, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (
                    item['title'],
                    item['description'],
                    item['category'],
                    item['difficulty'],
                    item['timeLimit'],
                    item['passingPercentage'],
                    item['createdAt'],
                    json.dumps(item['questions'])
                )
            )

    conn.commit()


@app.route('/')
def index():
    return send_file('index.html')


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'database': str(DB_PATH)})


def serialize_user(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'username': row['username'],
        'email': row['email'],
        'role': row['role'],
        'branch': row['branch'] if 'branch' in row.keys() and row['branch'] is not None else '',
        'rollNumber': row['roll_number'] if 'roll_number' in row.keys() and row['roll_number'] is not None else '',
        'createdAt': row['created_at'],
    }


def serialize_quiz(row):
    return {
        'id': row['id'],
        'title': row['title'],
        'description': row['description'],
        'category': row['category'],
        'difficulty': row['difficulty'],
        'timeLimit': row['time_limit'],
        'passingPercentage': row['passing_percentage'],
        'createdAt': row['created_at'],
        'questions': json.loads(row['questions'])
    }


def serialize_attempt(row):
    return {
        'id': row['id'],
        'studentId': row['student_id'],
        'quizId': row['quiz_id'],
        'quizTitle': row['quiz_title'],
        'score': row['score'],
        'total': row['total'],
        'percentage': row['percentage'],
        'date': row['date'],
        'timeTaken': row['time_taken'],
        'answers': json.loads(row['answers'])
    }


@app.route('/api/users')
def get_users():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM users ORDER BY id').fetchall()
    conn.close()
    return jsonify([serialize_user(r) for r in rows])


@app.route('/api/quizzes')
def get_quizzes():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM quizzes ORDER BY id').fetchall()
    conn.close()
    return jsonify([serialize_quiz(r) for r in rows])


@app.route('/api/attempts')
def get_attempts():
    student_id = request.args.get('student_id')
    conn = get_db_connection()
    if student_id:
        rows = conn.execute('SELECT * FROM attempts WHERE student_id = ? ORDER BY id DESC', (int(student_id),)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM attempts ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([serialize_attempt(r) for r in rows])


@app.route('/api/auth/student/login', methods=['POST'])
def student_login():
    data = request.get_json(silent=True) or {}
    email_or_username = (data.get('emailOrUsername') or data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not email_or_username or not password:
        return jsonify({'success': False, 'message': 'Username/email and password are required'}), 400

    conn = get_db_connection()
    row = conn.execute(
        'SELECT * FROM users WHERE role = ? AND (email = ? OR username = ?) AND password = ?',
        ('student', email_or_username, email_or_username, password)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    return jsonify({'success': True, 'user': serialize_user(row)})


@app.route('/api/auth/student/signup', methods=['POST'])
def student_signup():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    branch = (data.get('branch') or '').strip()
    roll_number = (data.get('rollNumber') or data.get('roll_number') or '').strip()

    if not name or not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    conn = get_db_connection()
    if conn.execute('SELECT 1 FROM users WHERE username = ? OR email = ?', (username, email)).fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Username or email already exists'}), 409

    created_at = datetime.now().strftime('%Y-%m-%d')
    cur = conn.execute(
        'INSERT INTO users (name, username, email, password, role, branch, roll_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (name, username, email, password, 'student', branch, roll_number, created_at)
    )
    conn.commit()
    new_user = conn.execute('SELECT * FROM users WHERE id = ?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'user': serialize_user(new_user)})


@app.route('/api/auth/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    secret = (data.get('secret') or '').strip()

    if not username or not password or not secret:
        return jsonify({'success': False, 'message': 'Username, password and secret are required'}), 400

    if secret != ADMIN_SECRET:
        return jsonify({'success': False, 'message': 'Incorrect admin secret'}), 401

    conn = get_db_connection()
    row = conn.execute(
        'SELECT * FROM users WHERE role = ? AND password = ? AND (username = ? OR email = ?)',
        ('admin', password, username, username)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({'success': False, 'message': 'Invalid admin credentials'}), 401

    return jsonify({'success': True, 'user': serialize_user(row)})


@app.route('/api/attempts', methods=['POST'])
def save_attempt():
    data = request.get_json(silent=True) or {}
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO attempts (student_id, quiz_id, quiz_title, score, total, percentage, date, time_taken, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (
            int(data.get('studentId')),
            int(data.get('quizId')),
            data.get('quizTitle') or 'Quiz',
            int(data.get('score')),
            int(data.get('total')),
            int(data.get('percentage')),
            data.get('date') or datetime.now().strftime('%Y-%m-%d'),
            data.get('timeTaken') or '00:00',
            json.dumps(data.get('answers') or [])
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Attempt saved'})


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json(silent=True) or {}
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    name = (data.get('name') or existing['name'] or '').strip()
    username = (data.get('username') or existing['username'] or '').strip()
    branch = (data.get('branch') or data.get('branchName') or existing['branch'] or '').strip()
    roll_number = (data.get('rollNumber') or data.get('roll_number') or existing['roll_number'] or '').strip()

    if not name or not username:
        conn.close()
        return jsonify({'success': False, 'message': 'Name and username are required'}), 400

    duplicate = conn.execute(
        'SELECT 1 FROM users WHERE username = ? AND id != ?',
        (username, user_id)
    ).fetchone()
    if duplicate:
        conn.close()
        return jsonify({'success': False, 'message': 'Username already taken'}), 409

    conn.execute(
        'UPDATE users SET name = ?, username = ?, branch = ?, roll_number = ? WHERE id = ?',
        (name, username, branch, roll_number, user_id)
    )
    conn.commit()
    updated = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'user': serialize_user(updated)})


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if existing['role'] != 'student':
        conn.close()
        return jsonify({'success': False, 'message': 'Only students can be deleted from this endpoint'}), 400

    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.execute('DELETE FROM attempts WHERE student_id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Student deleted'})


@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    category = (data.get('category') or '').strip()
    difficulty = (data.get('difficulty') or 'Easy').strip()
    time_limit = int(data.get('timeLimit') or 10)
    passing_percentage = int(data.get('passingPercentage') or 60)
    questions = data.get('questions') or []

    if not title or not description or not category:
        return jsonify({'success': False, 'message': 'Title, description and category are required'}), 400

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO quizzes (title, description, category, difficulty, time_limit, passing_percentage, created_at, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (title, description, category, difficulty, time_limit, passing_percentage, datetime.now().strftime('%Y-%m-%d'), json.dumps(questions))
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Quiz created'})


@app.route('/api/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    category = (data.get('category') or '').strip()
    difficulty = (data.get('difficulty') or 'Easy').strip()
    time_limit = int(data.get('timeLimit') or 10)
    passing_percentage = int(data.get('passingPercentage') or 60)
    questions = data.get('questions') or []

    if not title or not description or not category:
        return jsonify({'success': False, 'message': 'Title, description and category are required'}), 400

    conn = get_db_connection()
    quiz_exists = conn.execute('SELECT * FROM quizzes WHERE id = ?', (quiz_id,)).fetchone()
    if not quiz_exists:
        conn.close()
        return jsonify({'success': False, 'message': 'Quiz not found'}), 404

    conn.execute(
        'UPDATE quizzes SET title = ?, description = ?, category = ?, difficulty = ?, time_limit = ?, passing_percentage = ?, questions = ? WHERE id = ?',
        (title, description, category, difficulty, time_limit, passing_percentage, json.dumps(questions), quiz_id)
    )
    conn.commit()
    updated = conn.execute('SELECT * FROM quizzes WHERE id = ?', (quiz_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'quiz': serialize_quiz(updated)})


@app.route('/api/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM quizzes WHERE id = ?', (quiz_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Quiz deleted'})


@app.route('/api/admin/students')
def admin_students():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM users WHERE role = ? ORDER BY id', ('student',)).fetchall()
    students_payload = []
    for s in students:
        attempts = conn.execute('SELECT * FROM attempts WHERE student_id = ? ORDER BY id DESC', (s['id'],)).fetchall()
        avg = 0
        if attempts:
            avg = round(sum(a['percentage'] for a in attempts) / len(attempts))
        students_payload.append({
            'id': s['id'],
            'name': s['name'],
            'username': s['username'],
            'email': s['email'],
            'branch': s['branch'] or '',
            'rollNumber': s['roll_number'] or '',
            'createdAt': s['created_at'],
            'attempts': len(attempts),
            'avgScore': avg,
        })
    conn.close()
    return jsonify(students_payload)


init_db()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
