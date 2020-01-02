import React, { Component } from "react";
import "./App.css";
import Input from "./Input";
import Output from "./Output";
import NavBar from "./NavBar";
import { ThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import deepOrange from "@material-ui/core/colors/deepOrange";

const theme = createMuiTheme({
  palette: {
    primary: deepOrange,
    secondary: {
      main: "#ff5722"
    }
  }
});

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <NavBar />
        <Input />
        <Output />
      </ThemeProvider>
    );
  }
}

export default App;
