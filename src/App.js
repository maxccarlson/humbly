import './App.css';
import React, { Component, useEffect, useState } from "react";
import RegisterModal from "./components/RegisterModal";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import {login, authFetch, useAuth, logout} from "./auth";


const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      requestList: [],
      modal: false
    }
  }

  

  render() {           
      return (   
        <main className="container">
        <div style={{padding: '3px'}}></div>
        <h1 className="text-lowercase text-center my-4">humbly</h1>                        
        <div className="row">
          <div style={{ width: "auto"}} className="col-md-6 col-sm-10 mx-auto p-0">                        
            <h2 className="mb-5">Request Management</h2>
              <InnerApp />
          </div>
        </div>            
        </main>    
      ); 
    }            
  

  createRequest = () => {

  }
    
  renderList = () => {
    
  }

  toggle = () => {  
    this.setState({ modal: !this.state.modal });
  }  

  handleRegister = (item) => {
    this.toggle();

    /*
    if (item.requestNumber) {
      axios
        .put(`/api/humbly/${item.requestNumber}/`, item)
        .then((res) => this.refreshList());
      return;
    }
    item.requestNumber = "1";
    axios
      .post("/api/humbly/", item)
      .then((res) => this.refreshList());
      */
  };

}

function InnerApp() {
  const [logged] = useAuth();
  if(logged){
    return(    
      <div>             
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={App.createRequest}
          >
            New Request
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Request ID</th>                  
              <th scope="col">Requester</th>
              <th scope="col">Description</th>
              <th scope="col">Cost</th>
              <th scope="col">Urgency</th>
              <th scope="col">State</th>
            </tr>
          </thead>
          <tbody>
            {App.renderList}
          </tbody>
        </table>          
        <Login/>               
      </div>                     
    );      
  }
  else return <Login />
}

function Home() {
  return <h2>Home</h2>;
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState('')

  const [logged] = useAuth();

  const onSubmitClick = (e)=>{
    e.preventDefault()
    console.log("You pressed login")
    let opts = {
      'username': username,
      'password': password
    }
    console.log(opts)    
    fetch('/api/login', {
      method: 'post',
      body: JSON.stringify(opts)
    }).then(r => r.json())
      .then(token => {
        if (token.access_token){
          login(token)
          console.log(token)          
        }
        else {
          console.log("Please type in correct username/password")
        }
      })
  }

  const onCreateAccount = () => {
    toggle();
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const toggle = () => {  
    setModal(!modal);
  }  

  const handleRegister = (item) => {
    toggle();
    fetch('api/register', {
      method:'post',
      body: JSON.stringify(item)
    }).then(r => r.json())
    .then(req => {
      console.log("REQ=" + req.access_token)
    }) ;

    /*
    if (item.requestNumber) {
      axios
        .put(`/api/humbly/${item.requestNumber}/`, item)
        .then((res) => this.refreshList());
      return;
    }
    item.requestNumber = "1";
    axios
      .post("/api/humbly/", item)
      .then((res) => this.refreshList());
      */
  };

  return (
    <div>      
      {!logged? <div><form action="#">
        <h2>Login</h2>
        <div style={{padding: '3px'}}></div>
        <div>
          <input type="text" 
            placeholder="Username" 
            onChange={handleUsernameChange}
            value={username} 
          />
        </div>
        <div style={{padding: '3px'}}></div>
        <div>
          <input
            type="password"
            placeholder="Password"
            onChange={handlePasswordChange}
            value={password}
          />
        </div>
        <div style={{padding: '3px'}}></div>
        <button className="btn btn-secondary mr-2" onClick={onSubmitClick} type="submit">
          Sign In
        </button>        
      </form>    
      <div style={{padding: '3px'}}></div>
      <button className="btn btn-secondary mr-2" onClick={onCreateAccount} type="submit">
        Create Account
      </button>
      </div>  
      : <button onClick={() => logout()}>Sign Out</button>}
      {modal ? (
              <RegisterModal
                activeItem={{
                  username: "",
                  password: "",
                  organization: "TEST"}}
                toggle={toggle}
                onSave={handleRegister}
              />
      ) : null}

    </div>
  )
}


function Secret() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    authFetch("/api/protected").then(response => {
      if (response.status === 401){
        setMessage("Sorry you aren't authorized!")
        return null
      }
      return response.json()
    }).then(response => {
      if (response && response.message){
        setMessage(response.message)
      }
    })
  }, [])
  return (
    <h2>Secret: {message}</h2>
  )
}

export default App;