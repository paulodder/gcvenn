import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Container } from "@material-ui/core";
import CheckBoxInput from "./CheckBoxInput";
import CheckBoxInputTissue from "./CheckBoxInputTissue";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: "20px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}));

export default function Input() {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>
            Choose from the database
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ height: "60vh" }}>
          <CheckBoxInput />
          <CheckBoxInputTissue />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Container>
  );
}
