import logo from './logo.svg';
import './App.css';
import React, { Component, Header } from "react";
import Modal from "./components/Modal";
import axios from "axios";
import { Badge } from 'reactstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requestList: [],
      modal: false,
      activeItem: {
        description: "",
        urgency: 0,
      },
    };
  }
  
  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    axios
      .get("/api/humbly/")
      .then((res) => this.setState({ requestList: res.data }))
      .catch((err) => console.log(err));
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  handleSubmit = (item) => {
    this.toggle();

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
  };

  handleDelete = (item) => {
    axios
      .delete(`/api/humbly/${item.requestNumber}/`)
      .then((res) => this.refreshList());
  };

  createItem = () => {
    const item = { description: "", urgency: 0 };

    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  editItem = (item) => {
    this.setState({ activeItem: item, modal: !this.state.modal });
  };


  renderItems = () => {
    return this.state.requestList.map((item) => (
      
      <tr key={item.requestNumber}>        
        <th scope="row">{item.requestNumber}</th>
        <td>{item.state}</td>
        <td>{item.requester}</td>
        <td>{item.description}</td>
        <td>{item.price}</td>
        <td>{item.urgency}</td>
        <td>{item.justification}</td>
        <td>{item.notes}</td>
          
        <td>
          <button
            className="btn btn-secondary mr-2"
            onClick={() => this.editItem(item)}
          >Edit
          </button>
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.handleDelete(item)}
          >Delete
          </button>
        </td>          
      </tr>    
    ));
  };

  render() {
    return (
      <main className="container">
        <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0"> 
            <h1>humbly</h1>           
            <h2 className="mb-5">Request Management</h2>
            <div></div>
            <div className="mb-4">
              <button
                className="btn btn-primary"
                onClick={this.createItem}
              >
                Add request
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Req. No.</th>
                  <th scope="col">State</th>
                  <th scope="col">Requester</th>
                  <th scope="col">Description</th>
                  <th scope="col">Price</th>
                  <th scope="col">Urgency</th>
                  <th scope="col">Justification</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {this.renderItems()}
              </tbody>
            </table>            
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
      </main>
    );
  }
}

export default App;
