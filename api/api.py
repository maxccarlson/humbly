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
    admins = db.Column(db.Text)
    users = db.Column(db.Text)

    @property
    def get_admins(self):
        try:
            return self.admins.split(',')
        except Exception:
            return []

    @property
    def get_users(self):
        try:
            return self.users.split(',')
        except Exception:
            return []

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
    def meta(self):
        return {
            "id: " : self.id,
            "code: " : self.code,
            "name: " : self.name,
            "admins: " : self.admins,
            "users: " : self.users            
        }

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

    @property
    def orgs(self):
        try:
            return self.organization.split(',')
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
    req_user = db.Column(db.Text)
    req_user_id = db.Column(db.Integer)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    cost = db.Column(db.Float)
    cost_is_estimate = db.Column(db.Boolean)
    type = db.Column(db.Text)
    status = db.Column(db.Text)    
    create_date = db.Column(db.Date)
    update_date = db.Column(db.Date)
    
    @property
    def meta(self):
        return {
            "id" : self.id,
            "organization" : self.organization,
            "req_user" : self.req_user,
            "req_user_id" : self.req_user_id,
            "title" : self.title,
            "description" : self.description,
            "cost" : self.cost,
            "cost_is_estimate" : self.cost_is_estimate,
            "type" : self.type,
            "status" : self.status,
            "create_date" : self.create_date,
            "update_date" : self.update_date,

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
          admins="1"
		))
    
    # db.session.add(Request(
    #     req_user_id=1,
    #     organization='TEST',
    #     title='Test',
    #     description='desc',
    #     cost=0.0,
    #     cost_is_estimate=False
    # ))
    # db.session.add(Request(
    #     req_user_id=1,
    #     organization='TEST',
    #     title='Test2',
    #     description='aijfe',
    #     cost=15,
    #     cost_is_estimate=True
    # ))
    
    db.session.commit()

def is_float(num):
    try:
        float(num)
        return True
    except ValueError:
        return False

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

    with app.app_context():
        db.session.add(User(
            username=req.get('username', None),
            password=guard.hash_password(req.get('password', None)),
            roles='user',
            organization='TEST',
            is_active=True,
            ))             
        db.session.commit()

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
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200


@app.route('/api/my_requests', methods=['GET'])
@flask_praetorian.auth_required
def my_requests():
    user = flask_praetorian.current_user()
    
    request_list = []    
    if(user.roles == "admin"):
        requests =  db.session.query(Request).filter_by(organization=user.organization)
    else:
        requests =  db.session.query(Request).filter_by(req_user_id=user.id)    
    
    for e in requests:
        request_list.append(e.meta)
        
    ret = {'requests':request_list}    
    return ret,200

@app.route('/api/is_admin', methods=['POST'])
@flask_praetorian.auth_required
def is_admin():
    user = flask_praetorian.current_user()    
    org_code = flask.request.get_json(force=True)          
    is_admin = db.session.query(Organization).filter(Organization.admins.contains(user.id)).filter_by(code=org_code).first() is not None
    ret = {'is_admin':is_admin}       
    return ret,200

@app.route('/api/my_orgs', methods=['GET'])
@flask_praetorian.auth_required
def my_orgs():
    user = flask_praetorian.current_user()            
    ret = {'orgs':user.orgs}    
    return ret,200

@app.route('/api/create_organization', methods=['POST'])
@flask_praetorian.auth_required
def create_organization():    
    
    user = flask_praetorian.current_user()    
    req = flask.request.get_json(force=True)  

    with app.app_context():
        db.session.add(Organization(
                code = req.get('code', None),
                name = req.get('name', None),
                admins = user.id
            ))   
        user.organization += "," + req.get('code', None)
        db.session.commit()        

    ret = {'access_token': ''}  
    return ret, 200


@app.route('/api/create_request', methods=['POST'])
@flask_praetorian.auth_required
def create_request():    
    
    user = flask_praetorian.current_user()    
    req = flask.request.get_json(force=True)    
    cost = req.get('cost')
    type = "Normal"        
    reqid = req.get('id')

    print("EST")
    print(req.get('cost_is_estimate'))

    if not is_float(cost):
        ret = {'failure': 'Cost must be a decimal value'}  
        return ret, 200

    if req.get('urgent'):
        type = "Urgent"    

    with app.app_context():
        if(reqid == None):        
            db.session.add(Request(
                    organization = user.organization,
                    req_user = user.username,
                    req_user_id = user.id,                    
                    title = req.get('title', None),
                    description = req.get('description', None),
                    cost = cost,
                    cost_is_estimate = req.get('cost_is_estimate', None),
                    type = type,
                    status = "Pending",
                    create_date = date.today(),
                    update_date = date.today()
                ))     
            db.session.commit()        
        else:        
            this_request = db.session.query(Request).filter_by(id=reqid).first()
            this_request.title = req.get('title', None)
            this_request.description = req.get('description', None)
            this_request.cost = cost
            this_request.cost_is_estimate = req.get('cost_is_estimate', None)
            this_request.type = type
            this_request.status = "Pending" if req.get('edit') else req.get('status', None)
            this_request.update_date = date.today()
            db.session.commit()

    # reqs = db.session.query(Request).all()
    # for reqq in reqs:
    #     print(reqq.organization)
    #     print(reqq.req_user_id)
    #     print(reqq.title)
    #     print(reqq.description)
    #     print(reqq.cost)
    #     print(reqq.type)
    #     print(reqq.status)
    #     print(reqq.create_date)

    # users = db.session.query(User).all()
    # for user in users:
    #     print(user.meta)
    
    ret = {'access_token': ''}  
    return ret, 200

@app.route('/api/delete_request', methods=['POST'])
def delete_request():    
    
    req = flask.request.get_json(force=True)    
    id = req.get('id')    
    with app.app_context():
        qry = db.session.query(Request).filter_by(id=id)        
        qry.delete()  
        db.session.commit()

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