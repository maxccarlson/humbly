import './App.css';
import React, { Component, useEffect, useState } from "react";
import RegisterModal from "./components/RegisterModal";
import Modal from "./components/Modal";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import {login, authFetch, useAuth, logout} from "./auth";
import Card from "reactstrap";
import { render } from '@testing-library/react';


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
  const [modal, setModal] = useState('') 
  const [requestList, setRequestList] = useState([])  
  const [cards, setCards] = useState([])  
  const [refreshed, setRefreshed] = useState(false)
  
  const [logged] = useAuth();  

  const onCreateRequest = () => {
    toggle();
  }

  const toggle = () => {  
    setModal(!modal);            
  }  

  const handleCreate = (item) => {    
    authFetch('api/create_request', {
      method:'post',
      body: JSON.stringify(item)
    })

    // .then(r => {      
    //   r.json()      
    // })
    // .then(ret => {
    //   if (ret.failure > '')
    //     setErrorMessage(ret.failure)     
    //   else
    //     setErrorMessage('')     
    // }) ;
    toggle();    
  };
  
  const refreshList = () => {
    console.log("REFRESH")
    authFetch('api/my_requests', {
      method:'get',
    })    
    .then(r => r.json())
    .then(ret => {      
      setRequestList(ret.requests)  
      var cards = []
      let list = requestList
      for (let e in list)
      {        
        let r = list[e]
        let cost = r.cost_is_estimate ? (String("$" + r.cost + " (Est.)")) : String("$" + r.cost)
        let date = (r.create_date != null) ? r.create_date.split(' ')[1] + " " + r.create_date.split(' ')[2] + " " + r.create_date.split(' ')[3] : ""
        cards.push(          
          <tr key={r.id}>
            <th scope="row">{r.title}</th>          
            <td>{r.description}</td>
            <td>{cost}</td>
            <td>{r.status}</td>
            <td style={{fontSize:"10px"}}>{date}</td>
          </tr>         

        )       
            
        //   <td>
        //     <button
        //       className="btn btn-secondary mr-2"
        //       //onClick={() => this.editItem(item)}
        //     >Edit
        //     </button>
        //   </td>
        //   <td>
        //     <button
        //       className="btn btn-danger"
        //       //onClick={() => this.handleDelete(item)}
        //     >Delete
        //     </button>
        //   </td>          
        // </tr>) + '"'
      }
      
      setCards(cards)
      setRefreshed(true)

    })
  }
  
  if(logged){    
    if(!refreshed)
    {
      refreshList()      
    }
    return(    
      <div>             
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={onCreateRequest}
          >
            New Request
          </button>
        </div>        
          <button 
            //className="btn btn-secondary"
            onClick={refreshList}>
              Refresh List
          </button>

        <table className="table">
          <caption style={{captionSide:"top"}}>My Requests</caption>
          <thead>
            {/* <tr>
              <th scope="col">Title</th>                              
              <th scope="col">Description</th>
              <th scope="col">Cost</th>            
              <th scope="col">State</th>
            </tr> */}
          </thead>
          <tbody>    
            {cards
            }        
          </tbody>
        </table> 
              
        <Login/> 
        {modal ? (
              <Modal
                activeItem={{
                  title: "",
                  description: "",
                  cost: 0,
                  request_is_estimate: false,
                  urgent: false
                  }}
                toggle={toggle}
                onSave={handleCreate}
              />
      ) : null}              
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
  const [errorMessage, setErrorMessage] = useState("");

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
          setErrorMessage("Incorrect username/password")
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
    .then(ret => {
      if (ret.failure > '')
        setErrorMessage(ret.failure)     
      else
        setErrorMessage('')     
    }) ;
  };

  return (
    <div>      
      {!logged? <div><form action="#">
        <h2>Log In</h2>
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
        {errorMessage && <div style={{color:"red"}} className="error"> {errorMessage} </div>}
        <div style={{padding: '3px'}}></div>
        <button className="btn btn-primary mr-2" onClick={onSubmitClick} type="submit">
          Submit
        </button>        
      </form>    
      <div style={{padding: '3px'}}></div>
      <button className="btn btn-secondary mr-2" onClick={onCreateAccount} type="submit">
        Create Account
      </button>
      </div>  
      : <button className="btn btn-secondary mr-2" onClick={() => logout()}>
        Sign Out
      </button>}
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