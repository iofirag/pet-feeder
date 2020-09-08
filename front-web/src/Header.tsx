import React from 'react';
import './Header.scss';
import { AppContext } from './App';



export class Header extends React.Component<any, any> {

  render() {
    return (
      <div>
        <AppContext.Consumer>
          {(context: any) => (
            <React.Fragment>
              <header className="Header">
                <div
                  className={`back-bt ${context.state.client.content === "home" ? "invisible" : ""}`}
                  onClick={() => context.setContent("home")}
                ></div>
                <div className="logo">
                  <img
                    className="logo-image"
                    src="https://images-na.ssl-images-amazon.com/images/I/719BTZjp3NL._AC_SY450_.jpg"
                    alt=""
                  />
                  <div className="logo-name">Pet-Feeder</div>
                </div>
                <div
                  className={`settings-bt ${context.state.client.content === "settings" ? "invisible" : ""}`}
                  onClick={() => context.setContent("settings")}
                ></div>
              </header>
            </React.Fragment>
          )}
        </AppContext.Consumer>
        <hr />
      </div>
    );
  }
}