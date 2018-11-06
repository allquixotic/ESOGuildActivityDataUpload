import React, { Component } from 'react';
import SysTray from 'systray';
import fs from "fs";

import { render, Window, App, Box, TextInput, Menu } from 'proton-native';

const systray = new SysTray({
    menu: {
        // you should using .png icon in macOS/Linux, but .ico format in windows
        icon: new Buffer(fs.readFileSync("img/icon.ico")).toString('base64'),
        title: "Guild Activity Stats",
        tooltip: "Guild Activity Stats",
        items: [{
            title: "Settings",
            tooltip: "Guild Activity Stats Settings",
            enabled: true
        }, {
            title: "Exit",
            tooltip: "Quits Guild Activity Stats.",
            enabled: true
        }]
    },
    debug: false,
    copyDir: true
})

systray.onClick(action => {
    if (action.seq_id === 0) {
      console.log("Hi!");
    } else if (action.seq_id === 1) {
      systray.kill()
    }
});

const stop = ()=>{
  systray.kill(false)
};

class Example extends Component {
  render() {
    return (
      <App onShouldQuit={stop}>
        <Menu>
          <Menu.Item type="Quit"/>
        </Menu>
        <Window onClose={stop} title="Proton Native Rocks!" size={{w: 400, h: 400}} menuBar={false}>
            <Box>
            	<TextInput>Hi</TextInput>
            </Box>
        </Window>
      </App>
    );
  }
}

render(<Example />);