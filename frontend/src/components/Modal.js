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

    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }

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
            <FormGroup>
              <Label for="request-description">Description</Label>
              <Input
                type="text"
                id="request-description"
                name="desc"
                value={this.state.activeItem.description}
                onChange={this.handleChange}
                placeholder="Enter Request description"
              />
            </FormGroup>
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