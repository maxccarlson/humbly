import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Col,
} from "reactstrap";

export default class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: this.props.activeItem,
    };
  }

  handleChange = (e) => {        
    let { name, value } = e.target;    
    const activeItem = { ...this.state.activeItem, [name]: value };    
    this.setState({ activeItem });
  };

  render() {
    const { toggle, onSave } = this.props;
    return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>New Request</ModalHeader>
        <ModalBody>
          <Form>           
            <FormGroup>
              <Label for="request-title">Title</Label>
              <Input
                  className="w-250"
                  type="text"
                  id="request-title"
                  name="title"
                  value={this.state.activeItem.title}
                  onChange={this.handleChange}
                  placeholder="Enter Request Title"                            
              />
            </FormGroup>
            <FormGroup>
              <Label for="request-description">Description</Label>
              <Input
                  className="w-250"
                  type="text"
                  id="request-description"
                  name="description"
                  value={this.state.activeItem.description}
                  onChange={this.handleChange}
                  placeholder="Enter Request Description"                            
              />
            </FormGroup>        
            <FormGroup>
              <Label for="request-cost">Cost</Label>
              <Input
                  type="text"
                  id="request-cost"
                  name="cost"
                  value={this.state.activeItem.cost}
                  onChange={this.handleChange}
                  placeholder="Enter Request Cost"
              />
            </FormGroup>
            <FormGroup>
              <Label for="request-estimate">Cost is Estimate  </Label>
              <Input
                  type="checkbox"
                  id="request-estimate"
                  name="estimate"
                  value={this.state.activeItem.request_is_estimate}
                  onChange={this.handleChange}                  
              />
            </FormGroup>
            <FormGroup>
              <Label for="request-urgent">Urgent  </Label>
              <Input
                  type="checkbox"
                  id="request-urgent"
                  name="urgent"
                  value={this.state.activeItem.urgent}
                  onChange={this.handleChange}                  
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="blue"
            className="btn btn-primary"
            onClick={() => onSave(this.state.activeItem)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}