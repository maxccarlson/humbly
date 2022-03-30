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

export default class RegisterModal extends Component {
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
        <ModalHeader toggle={toggle}>New User</ModalHeader>
        <ModalBody>
          <Form>  
                              
            <FormGroup>
                <Label for="register-username">Username</Label>
                <Input
                    className="w-250"
                    type="text"
                    id="register-username"
                    name="username"
                    value={this.state.activeItem.username}
                    onChange={this.handleChange}
                    placeholder="Enter Username"                            
                />
            </FormGroup>
                                
            
            <FormGroup>
                <Label for="register-password">Password</Label>
                <Input
                    type="text"
                    id="register-password"
                    name="password"
                    value={this.state.activeItem.password}
                    onChange={this.handleChange}
                    placeholder="Enter Password"
                />
            </FormGroup>

            <FormGroup>
                <Label for="register-orgnization">Organization</Label>
                <Input
                    className="w-250"
                    type="text"
                    id="register-organization"
                    name="organization"
                    value={this.state.activeItem.organization}
                    onChange={this.handleChange}
                    placeholder="Enter Organization"                            
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