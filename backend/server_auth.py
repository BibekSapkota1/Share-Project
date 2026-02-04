# @app.route('/api/auth/signup', methods=['POST'])
# def signup():
#     """Create new user account"""
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')
    
#     # Validate
#     if not email or not password:
#         return jsonify({'error': 'Email and password required'}), 400
    
#     # Check if user exists
#     # Hash password
#     # Create user
#     # Return token

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     """Login user"""
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')
    
#     # Find user
#     # Verify password
#     # Update last_login
#     # Return token

# @app.route('/api/auth/verify', methods=['GET'])
# def verify():
#     """Verify token is valid"""
#     token = request.headers.get('Authorization')
#     # Verify and return user info


"""
server_auth.py  –  Auth route implementations (reference / Blueprint-ready)

These three routes are currently inlined in app.py.  If you want to split them
into their own Blueprint in the future, paste them into a Flask Blueprint and
register it in app.py with:

    from server_auth import auth_bp
    app.register_blueprint(auth_bp)

The logic below is kept in sync with app.py so you can do a straight cut-paste.
"""

# ── uncomment the block below when you're ready to use a Blueprint ───────────
from flask import Blueprint, Flask, request, jsonify
from auth import hash_password, verify_password, create_token
from app import get_db   # or pass the pool in another way

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    """Create new user account"""
    try:
        data = request.json
        email    = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400

        with get_db() as cursor:
            cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email already registered'}), 400

            password_hash = hash_password(password)
            cursor.execute(
                'INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email, created_at',
                (email, password_hash)
            )
            user  = cursor.fetchone()
            token = create_token(user['id'], user['email'])

            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'created_at': user['created_at'].isoformat()
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        email    = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        with get_db() as cursor:
            cursor.execute(
                'SELECT id, email, password_hash, created_at FROM users WHERE email = %s AND is_active = TRUE',
                (email,)
            )
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'Invalid email or password'}), 401

            if not verify_password(password, user['password_hash']):
                return jsonify({'error': 'Invalid email or password'}), 401

            cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))

            token = create_token(user['id'], user['email'])
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'created_at': user['created_at'].isoformat()
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@auth_bp.route('/api/auth/verify', methods=['GET'])
def verify():
    """Verify token and return user info"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        from auth import verify_token
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token is invalid'}), 401

        with get_db() as cursor:
            cursor.execute(
                'SELECT id, email, created_at, last_login FROM users WHERE id = %s AND is_active = TRUE',
                (user_id,)
            )
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'created_at': user['created_at'].isoformat(),
                    'last_login': user['last_login'].isoformat() if user['last_login'] else None
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500