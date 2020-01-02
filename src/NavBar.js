import React, { Component } from "react";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

class NavBar extends Component {
  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              GCVENN WebApp
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default NavBar;
