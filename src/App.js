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
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import {login, authFetch, useAuth, logout} from "./auth";
import Card from "reactstrap";
import { render } from '@testing-library/react';

const queryClient = new QueryClient()

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}

function App () {
                   
  return (   
    <main className="container">
    <div style={{padding: '3px'}}></div>
    <h1 className="text-lowercase text-center my-4">humbly</h1>                        
    <div className="row">
      <div style={{ width: "auto"}} className="col-md-6 col-sm-10 mx-auto p-0">                        
        <h2 className="mb-5 text-center">Request Management</h2>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>          
      </div>
    </div>            
    </main>    
  );                 

}



const refreshMyList = async () => {  
  const ret = await
  authFetch('api/my_requests', {
    method:'get',
  })
  .then(r => r.json())
  .then(rt => {
    rt = rt.requests
    return rt;
  }
  );  
  
  return ret;
}

function InnerApp() {
  const [modal, setModal] = useState(false)  
  const [roles, setRoles] = useState('')
  const [activeItem, setActiveItem] = useState([])
  const [logged] = useAuth();    


  const { status, data, error } = useQuery('requests', refreshMyList)
  const queryClient = useQueryClient()
  
  const deleteMutation = useMutation(delRequest => {
    return fetch('api/delete_request',
           {method:'post',
           body: JSON.stringify(delRequest)
          })
    }        
  );

  const createMutation = useMutation(newRequest => {
    return authFetch('api/create_request', {
      method:'post',
      body: JSON.stringify(newRequest)
    })
  });  

  const onSave = (r) => {
    createMutation.mutate(r)
    toggle()
  }

  const onClickDelete = (r) => {
    deleteMutation.mutate(r)
    // fetch('api/delete_request',
    //        {method:'post',
    //        body: JSON.stringify(r)
    //       })
  }

  const onClickCreate = () => {
    setActiveItem({
        title: "",
        description: "",
        cost: 0,
        request_is_estimate: false,
        urgent: false
        });
    toggle();
  }

  const onClickEdit = (r) => {
    setActiveItem(r);
    toggle();
  }

  const toggle = () => {  
    setModal(!modal);            
  }  

  const fetchRoles = () => {
   authFetch('api/my_roles', {method:'get'})
    .then(r => r.json())
    .then(rl => {
      rl = rl.roles
      console.log(rl)
      setRoles(rl)
    })
  }

  useEffect(() => {
    fetchRoles()
  })
  

  if(logged){        
    return(    
      <div>             
        <div className="row justify-content-center">
          <button
            className="btn btn-warning btn-lg"
            style={{width:"30%"}}
            onClick={onClickCreate}
          >
            New Request
          </button>
          
        </div>     
        {/* <p>{status}</p>                     
        <p>{error}</p>   */}
        {/* {createMutation.isSuccess ? <div>Request added!</div> : null}               */}
        <table className="table table-hover">
          <caption style={{captionSide:"top"}}>My Requests</caption>
          <thead className="thead-dark">
            { <tr>
              <th scope="col">Title</th>                              
              <th scope="col">Description</th>
              <th scope="col">Cost</th>            
              <th scope="col">State</th>
              <th scope="col">Created</th>
              {(roles == "admin") ? (
                <th scope="col">User</th>
              ) : null}
            </tr> }
          </thead>
          <tbody>                
            {typeof(data) !== 'undefined' ?               
            data.map((r) => (
              <tr key={r.id}>              
              <th scope="row">{r.title}</th>                        
              <td>{r.description}</td>
              <td>{r.cost_is_estimate ? (String("$" + r.cost + " (Est.)")) : String("$" + r.cost)}</td>
              <td>{r.status}</td>
              <td style={{fontSize:"10px"}}>{(r.create_date != null) ? r.create_date.split(' ')[1] + " " + r.create_date.split(' ')[2] + " " + r.create_date.split(' ')[3] : ""}</td>
              {(roles == "admin") ? (
                <td style={{}}>{r.req_user}</td>
              ) : null}
              {(roles == "admin") ? (

                <td>
                  <button 
                    className="btn btn-outline-success btn-sm"                                    
                    // onClick={() => onClickEdit(r)}
                    >Approve
                  </button>                   
                  <span style={{paddingRight: '4px'}}></span>
                  <button 
                    className="btn btn-outline-danger btn-sm"                                    
                    // onClick={() => onClickDelete(r)}
                    >Deny
                  </button>
                  <span style={{paddingRight: '4px'}}></span>
                  <button                     
                    className="btn btn-outline-primary btn-sm"                                    
                    onClick={() => onClickEdit(r)}
                    >Edit
                  </button>
                  <span style={{paddingRight: '4px'}}></span>
                  <button 
                    className="btn btn-outline-danger btn-sm"                                    
                    onClick={() => onClickDelete(r)}
                    //style={{color:"red"}}
                    >X
                  </button>
                </td>

              ) : (

              <td>
                  <button                     
                    className="btn btn-primary"                                    
                    onClick={() => onClickEdit(r)}
                    >Edit
                  </button>

                  <button 
                    className="btn"                                    
                    onClick={() => onClickDelete(r)}
                    style={{color:"red"}}
                    >X
                  </button>
              </td>  )
              }
                                         
            </tr>
            )) : null
            }        
          </tbody>
          
        </table>                     
        
        <Login/> 
        {modal ? (
              <Modal
                // activeItem={{
                //   title: "",
                //   description: "",
                //   cost: 0,
                //   request_is_estimate: false,
                //   urgent: false
                //   }}
                activeItem={activeItem}
                toggle={toggle}
                onSave={onSave}
              />
      ) : null}              
      </div>                     
    );      
  }
  else return <Login />
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
      : <button style={{
          position: 'absolute',
          left: '35%',
          bottom: '10%'
        }} className="btn btn-secondary mr-2" onClick={() => logout()}>
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

export default App;