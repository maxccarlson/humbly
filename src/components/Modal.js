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
        <ModalHeader toggle={toggle}>Request</ModalHeader>
        <ModalBody>
          <Form>  
            <table>
                <tbody>
                    <tr>
                        <td>                           
                            {/* <FormGroup>
                            <Label for="request-number">Req. No.</Label>
                            <Input
                                type="number"
                                id="request-number"
                                name="requestNumber"
                                value={this.state.activeItem.requestNumber}
                                onChange={this.handleChange}
                                placeholder="Enter Request Number"
                            />
                            </FormGroup>     */}                               
                        </td>
                        <td>
                            <FormGroup>
                            <Label for="request-state">State</Label>
                            <Input
                                type="text"
                                id="request-state"
                                name="state"
                                value={this.state.activeItem.state}
                                onChange={this.handleChange}
                                placeholder="Enter Request State"
                            />
                            </FormGroup>
                        </td>   
                    </tr>
                
                     <tr> 
                         <td>
                            <FormGroup>
                            <Label for="request-requester">Requester</Label>
                            <Input
                                type="text"
                                id="request-requester"
                                name="requester"
                                value={this.state.activeItem.requester}
                                onChange={this.handleChange}
                                placeholder="Enter Request requester"
                            />
                            </FormGroup>
                        </td>        
                        <td>
                            <FormGroup>
                            <Label for="request-urgency">Urgency</Label>
                            <Input
                                type="number"
                                id="request-urgency"
                                name="urgency"
                                value={this.state.activeItem.urgency}
                                onChange={this.handleChange}
                                placeholder="Enter Request urgency"
                            />
                            </FormGroup>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <FormGroup>
                            <Label for="request-price">Price</Label>
                            <Input
                                type="number"
                                id="request-price"
                                name="price"
                                value={this.state.activeItem.price}
                                onChange={this.handleChange}
                                placeholder="Enter Price"
                            />
                            </FormGroup>
                        </td>
                        <td>
                            <FormGroup>
                            <Label for="request-justification">Justification</Label>
                            <Input
                                type="text"
                                id="request-justification"
                                name="justification"
                                value={this.state.activeItem.justification}
                                onChange={this.handleChange}
                                placeholder="Enter Request Justification"
                            />
                            </FormGroup>
                        </td>
                    </tr>
                </tbody>
            </table>                    
            <FormGroup>
                <Label for="request-description">Description</Label>
                <Input
                    className="w-250"
                    type="text"
                    id="request-description"
                    name="description"
                    value={this.state.activeItem.description}
                    onChange={this.handleChange}
                    placeholder="Enter Request description"                            
                />
            </FormGroup>
                                
            
            <FormGroup>
            <Label for="request-notes">Notes</Label>
            <Input
                type="text"
                id="request-notes"
                name="notes"
                value={this.state.activeItem.notes}
                onChange={this.handleChange}
                placeholder="Enter Request Notes"
            />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}