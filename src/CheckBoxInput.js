import React, { Component } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

class CheckBoxInput extends Component {
  render() {
    return (
      <FormControl component="fieldset" style={{ margin: "0 50px 0 0" }}>
        <FormLabel component="legend">Choose Database</FormLabel>
        <FormGroup aria-label="position" column>
          <FormControlLabel
            value="TCGA"
            control={<Checkbox color="primary" />}
            label="TCGA (cancer)"
            labelPlacement="end"
          />
          <FormControlLabel
            value="GTEx"
            control={<Checkbox color="primary" />}
            label="GTEx (healthy)"
            labelPlacement="end"
          />
        </FormGroup>
      </FormControl>
    );
  }
}

export default CheckBoxInput;
