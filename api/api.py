#from ast import operator
from ast import Or
from email.policy import default
from http import server
import operator
from enum import unique
import os
from urllib import request
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
from sqlalchemy.sql.expression import func
import logging
from datetime import date

db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.Text, unique=True)
    name = db.Column(db.Text)    

    @property
    def get_id(self):
        return self.id
    
    @property
    def get_code(self):
        return self.code

    @property
    def get_name(self):
        return self.name

    @property
    def get_allow_list(self):
        return self.allow_list
    
class AllowList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    organization = db.Column(db.Text)
    user_id = db.Column(db.Integer)

# A generic user model that might be used by an app powered by flask-praetorian
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    roles = db.Column(db.Text)
    organization = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default='true')    

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active

    @property
    def meta(self):
        return {
            "id: " : self.id,
            "username: " : self.username,
            "password: " : self.password,
            "roles: " : self.roles,
            "organization: " : self.organization,
            "is_active: " : self.is_active
        }

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    organization = db.Column(db.Text)
    req_user_id = db.Column(db.Integer)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    cost = db.Column(db.Numeric)
    cost_is_estimated = db.Column(db.Boolean)
    type = db.Column(db.Text)
    status = db.Column(db.Text)    
    create_date = db.Column(db.Date)
    update_date = db.Column(db.Date)
    
    @property
    def meta(self):
        return {
            "id: " : self.id,
            "organization: " : self.organization,
            "req_user_id: " : self.req_user_id,
            "title: " : self.title,
            "description: " : self.description,
            "cost: " : self.cost,
            "cost_is_estimated: " : self.cost_is_estimated,
            "type: " : self.type,
            "status: " : self.status,
            "create_date: " : self.create_date,
            "update_date: " : self.update_date,

        }

# Initialize flask app for the example
app = flask.Flask(__name__, static_folder='../build', static_url_path=None)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the example app
cors.init_app(app)

logging.basicConfig(level=logging.DEBUG)

# Add users for the example
with app.app_context():
    db.drop_all()
    db.create_all()
    if db.session.query(User).filter_by(username='max').count() < 1:
        db.session.add(User(
          username='max',
          password=guard.hash_password('pass'),
          roles='admin',
          organization='TEST'
		))
    if db.session.query(Organization).filter_by(code='TEST').count() < 1:
        db.session.add(Organization(
          code='TEST',
          name='Test Organization',
		))
    if db.session.query(AllowList).filter_by(id=1).count() < 1:
        db.session.add(AllowList(
          organization='TEST',
          user_id=1,
		))
    if db.session.query(Request).filter_by(title='Test').count() < 1:
        db.session.add(Request(
          req_user_id=1,
          organization='TEST',
          title='Test'
		))
    db.session.commit()


# Set up some routes for the example
@app.route('/api/')
def home():
  	return {"Hello": "World"}, 200

@app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
    issuing a JWT token.
    .. example::
       $ curl http://localhost:5000/api/login -X POST \
         -d '{"username":"max","password":"pass"}'
    """      
    req = flask.request.get_json(force=True)                
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}       
    return ret, 200
    
    

@app.route('/api/register', methods=['POST'])
def register():    

    req = flask.request.get_json(force=True)    
    org = req.get('organization', None)

    exists = db.session.query(Organization).filter_by(code=org).first() is not None

    if not exists:
        ret = {'failure': 'Organization does not exist.'}  
        return ret, 200

    with app.app_context():
        db.session.add(User(
            username=req.get('username', None),
            password=guard.hash_password(req.get('password', None)),
            roles='user',
            organization=org,
            is_active=True,
            ))     
        db.session.add(AllowList(
          organization=org,
          user_id = ''.join(str(e) for e in [item[0] for item in (db.session.query(func.max(User.id)).all())]).replace('[','').replace(']','') 
		))
        db.session.commit()

    # allows = db.session.query(AllowList).all()
    # for allow in allows:
    #     print(allow.user_id)

    # users = db.session.query(User).all()
    # for user in users:
    #     print(user.meta)
    
    ret = {'access_token': ''}  
    return ret, 200

@app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refrehsed access expiration.
    .. example::
       $ curl http://localhost:5000/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200


@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    """
    A protected endpoint. The auth_required decorator will require a header
    containing a valid JWT
    .. example::
       $ curl http://localhost:5000/api/protected -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    return {"message": f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}

@app.route('/api/my_requests', methods=['POST'])
@flask_praetorian.auth_required
def my_requests():
    user = flask_praetorian.current_user()
    requests =  db.session.query(Request).filter_by(req_user_id=user.id)
    request_list = []    
    for e in requests:
        request_list.append(e.meta)
    #print(request_list)   
    ret = {'requests':request_list}    
    return ret,200

@app.route('/api/create_request', methods=['POST'])
@flask_praetorian.auth_required
def create_request():    
    
    user = flask_praetorian.current_user()    
    req = flask.request.get_json(force=True)    
    cost = req.get('cost')
    type = "Normal"        

    if not cost.isdecimal():
        ret = {'failure': 'Cost must be a decimal value'}  
        return ret, 200

    if req.get('urgent'):
        type = "Urgent"

    with app.app_context():
        db.session.add(Request(
                organization = user.organization,
                req_user_id = user.id,
                title = req.get('title', None),
                description = req.get('description', None),
                cost = cost,
                type = type,
                status = "Pending",
                create_date = date.today(),
                update_date = date.today()
            ))     
        db.session.commit()

    reqs = db.session.query(Request).all()
    for req in reqs:
        print(req.organization)
        print(req.req_user_id)
        print(req.title)
        print(req.description)
        print(req.cost)
        print(req.type)
        print(req.status)
        print(req.create_date)

    # users = db.session.query(User).all()
    # for user in users:
    #     print(user.meta)
    
    ret = {'access_token': ''}  
    return ret, 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    print("Hello from catch all")
    if path != "" and os.path.exists(os.path.join('..','build',path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)