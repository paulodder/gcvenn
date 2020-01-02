import React, { Component } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import TissueC from "./tissueC";
import TissueH from "./tissueH";
import { Container } from "@material-ui/core";

class CheckBoxInputTissue extends Component {
  render() {
    return (
      <Container>
        <FormControl component="fieldset">
          <FormLabel component="legend">TCGA Tissues</FormLabel>
          <FormGroup aria-label="position" column style={{ height: "100%" }}>
            {TissueC.map(arr => (
              <FormControlLabel
                style={{ marginRight: "50px" }}
                value={arr.name}
                control={<Checkbox color="primary" />}
                label={arr.name}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
          <FormLabel component="legend">GTEx Tissues</FormLabel>
          <FormGroup aria-label="position" column>
            {TissueH.map(arr => (
              <FormControlLabel
                style={{ marginRight: "50px" }}
                value={arr.name}
                control={<Checkbox color="primary" />}
                label={arr.name}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
        </FormControl>
      </Container>
    );
  }
}

export default CheckBoxInputTissue;
