import './App.css';
import React, { Component, useEffect, useState } from "react";
import Modal from "./components/Modal";
import RegisterModal from "./components/RegisterModal";
import OrganizationModal from "./components/OrganizationModal";

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
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
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
  const [orgModal, setOrgModal] = useState(false)  
  const [droppedDown, setDroppedDown] = useState(false)    
  const [orgs, setOrgs] = useState([])
  const [activeOrg, setActiveOrg] = useState('')
  const [activeAdmin, setActiveAdmin] = useState(false)
  const [activeItem, setActiveItem] = useState([])
  const [logged] = useAuth();    

  const { status, data, error } = useQuery('requests', refreshMyList)
  // const queryClient = useQueryClient()
  
  const deleteMutation = useMutation(delRequest => {
    return fetch('api/delete_request',{
      method:'post',
      body: JSON.stringify(delRequest)
    })            
  });

  const createMutation = useMutation(newRequest => {
    return authFetch('api/create_request', {
      method:'post',
      body: JSON.stringify(newRequest)
    })
  });   

  const createOrgMutation = useMutation(newOrg => {
    return authFetch('api/create_organization', {
      method:'post',
      body: JSON.stringify(newOrg)
    })
  });   

  const toggle = () => {  
    setModal(!modal);            
  }  
  
  const onSave = (r) => {
    createMutation.mutate(r)
    toggle()
  }

  const orgToggle = () => {  
    setOrgModal(!orgModal);            
  }  
  
  const orgSave = (r) => {
    createOrgMutation.mutate(r)
    orgToggle()
    // setDroppedDown(!droppedDown)
  }

  const onClickDelete = (r) => {
    deleteMutation.mutate(r)
  }

  const onClickCreate = () => {
    setActiveItem({
        title: "",
        description: "",
        cost: 0,
        cost_is_estimate: false,
        urgent: false
        });
    toggle();
  }

  const onClickDropdown = () => {    
    setDroppedDown(!droppedDown)
  }

  const onClickNewOrg = () => {   
    orgToggle()
  }

  const onClickEdit = (r) => {
    r.edit = true
    r.urgent = (r.type === "Urgent")
    setActiveItem(r);    
    toggle();
  }

  const onClickApprove = (r) => {
    r.status = "Approved"
    r.urgent = (r.type === "Urgent")
    createMutation.mutate(r);
  }

  const onClickDeny = (r) => {
    r.status = "Denied"
    r.urgent = (r.type === "Urgent")
    createMutation.mutate(r);
  }  

  

  const fetchOrgs = () => {
    authFetch('api/my_orgs', {method:'get'})
     .then(o => o.json())
     .then(og => {
       og = og.orgs
      //  console.log(og)
       setOrgs(og)
     })
   }

  useEffect(() => {

    const isAdmin = () => {
      authFetch('api/is_admin', {method:'post', body: JSON.stringify(activeOrg)})
       .then(a => a.json())
       .then(ad => {
         ad = ad.is_admin         
         setActiveAdmin(ad)
       })
     }

    if(activeOrg==='')
      setActiveOrg('TEST')
    isAdmin()
    fetchOrgs()
  },[activeOrg])
  

  if(logged){        
    return(    
      <div>             
        <div className="row justify-content-center">
          <button
            className="btn btn-warning btn-lg"
            style={{width:"275px"}}
            onClick={onClickCreate}
          >
            New Request
          </button>
          <span style={{paddingTop: '20px'}}></span>          
        </div>     

        <div className="dropdown" style={{
          position: 'absolute',
          right: '27%',
          top: '4%'
        }}>
          <button onClick={onClickDropdown} className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Organization
          </button>
          {(droppedDown) ? (          
          <div className="dropdown-menu show" aria-labelledby="dropdownMenu"> 
            {(typeof(orgs) !== 'undefined') ? orgs.map((o) => (<button className="dropdown-item" type="button" key={o}>{o}</button>)) : null}            
            <button style={{backgroundColor:"gold"}} className="dropdown-item" type="button" onClick={onClickNewOrg}>New Organization</button>                              
          </div>
          )
           : null}            
        </div>        
          <table className="table table-hover">
            <caption style={{captionSide:"top"}}>Requests</caption>
            <thead className="thead-dark">
              { <tr>
                <th scope="col">Title</th>                              
                <th scope="col">Description</th>
                <th scope="col">Cost</th>            
                <th scope="col">State</th>
                <th scope="col">Created</th>
                {(activeAdmin) ? (
                  <th scope="col">User</th>
                ) : null}
              </tr> }
            </thead>            
            <tbody> 
              {typeof(data) !== 'undefined' ?               
              data.map((r) => (

                <tr key={r.id}
                  className={(r.type === "Urgent") ? "table-danger" : "table-light"}
                >                            
                  <th scope="row" key={r.title}>{r.title}</th>               
                  <td key={r.description}>{r.description}</td>
                  <td key={r.cost}>{r.cost_is_estimate ? (String("$" + r.cost + " (Est.)")) : String("$" + r.cost)}</td>
                  <td key={r.status} className={(r.status === "Approved") ? "table-success" : ((r.status === "Denied") ? "table-danger" : "table-light")}>{r.status}</td>
                  <td key={r.create_date} style={{fontSize:"10px"}}>{(r.create_date != null) ? r.create_date.split(' ')[1] + " " + r.create_date.split(' ')[2] + " " + r.create_date.split(' ')[3] : ""}</td>
                  {(activeAdmin) ? (
                    <td key={r.req_user} style={{}}>{r.req_user}</td>
                  ) : null}
                  {(activeAdmin) ? (
                    <td>
                      <div className="btn-toolbar" role="toolbar" aria-label="Button Bar">
                        <div className="btn-group mr-2" role="group" aria-label="Button Group">
                          <button 
                            className="btn btn-outline-success btn-sm"                                    
                            onClick={() => onClickApprove(r)}
                            >Approve
                          </button>                   
                          <span style={{paddingRight: '4px'}}></span>
                          <button 
                            className="btn btn-outline-danger btn-sm"                                    
                            onClick={() => onClickDeny(r)}
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
                        </div>
                      </div>
                    </td>

                ) : (

                <td>
                  <div className="btn-toolbar" role="toolbar" aria-label="Button Bar">
                    <div className="btn-group mr-2" role="group" aria-label="Button Group">
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
                    </div>
                  </div>
                </td>  )
                }
                {(r.type === "Urgent") ? <td style={{color:"firebrick"}}>URGENT</td> : null}                                         
                </tr>               
              )) : null}
            </tbody>            
          </table>     
        
        <Login/> 
        {modal ? (
              <Modal                
                activeItem={activeItem}
                toggle={toggle}
                onSave={onSave}
              />
      ) : null}

        {orgModal ? (
              <OrganizationModal                
                activeItem={{
                  code: "",
                  name: ""
                  }}
                toggle={orgToggle}
                onSave={orgSave}
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
          left: '32%',
          top: '4%'
        }} className="btn btn-outline-secondary btm-sm" onClick={() => logout()}>
        Sign Out
      </button>}
      {modal ? (
              <RegisterModal
                activeItem={{
                  username: "",
                  password: ""
                  }}
                toggle={toggle}
                onSave={handleRegister}
              />
      ) : null}

    </div>
  )
}

export default App;