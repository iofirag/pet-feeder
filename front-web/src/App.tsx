import React, { Component } from 'react';
import Modal from "react-modal";
import {Header} from './Header'
import './App.scss';
import { Home } from './Home';
import { Settings } from './Settings';
import HttpService from './HttpService';


const customStyles: any = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

const defaultPetPictureUrl: string =
  "https://www.sqfi.com/wp-content/uploads/2018/10/Lab-eating-Dog-Food-300x200.jpg";

export const AppContext = React.createContext({});
export class MyProvider extends Component<any,any> {
  
  constructor(props: any) {
    super(props);
    this.state = {
      settings: {
        petName: "pet-name",
        petPictureUrl: defaultPetPictureUrl,
        feedTime: '15:30',
        turnSeconds: 7,
        numberOfFeedEveryDay: 1,
        delayHoursBetweenFeeds: 0,
        lastFeedTsList: [],
      },
      client: {
        content: "home",
        httpResponse: "",
        isModalOpen: false,
      }
    }  
  }
  
  fetchSettings = async () => {
    try {
      const httpRes = await HttpService.executeRequest(`${process.env.REACT_APP_PET_FEEDER_REST_ENDPOINT}/settings`)
      if (httpRes.status !== 200) throw 'Error: bad request'
      
      const httpJsonRes = await httpRes.json();
      this.setState({
        ...this.state,
        settings: {
          ...this.state.settings,
          ...httpJsonRes
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
  componentDidMount() {
    this.fetchSettings()
  }
  render() {
    return (
      <AppContext.Provider value={{
          state: this.state,
          setTurnSeconds: (turnSeconds: number) => {this.setState({
            settings: {
              ...this.state.settings,
              turnSeconds
            }
          })},
          updateSettings: (key: string, value: any)=> {this.setState({
            settings: {
              ...this.state.settings,
              [key]: value,
            }
          })},
          setContent: (content:string) => this.setState({
            client: {
              ...this.state.client,
              httpResponse: '',
              content,
            }
          }),
          setHttpResponse: (httpResponse: string) => this.setState({
            client: {
              ...this.state.client,
              httpResponse,
            }
          }),
          setModalOpen: () => this.setState({
            client: {
              ...this.state.client,
              isModalOpen: true,
            }
          }),
          setModalClose: () => this.setState({
            client: {
              ...this.state.client,
              isModalOpen: false, 
              httpResponse: '',
            }
          }),
        }}>
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

export default class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <MyProvider>
        <div className="App">
          <AppContext.Consumer>
            {(context: any) => (
              <React.Fragment>
                <Modal
                  isOpen={context.state.client.isModalOpen}
                  onRequestClose={() => context.setModalClose()}
                  style={customStyles}
                >
                  <div className={`modal ${context.state.client.httpResponse}`}></div>
                </Modal>
                <Header></Header>
                {context.state.client.content === "home" ?
                  (<Home></Home>)
                  :
                  (<Settings context={context}></Settings>)
                }
              </React.Fragment>
            )}
          </AppContext.Consumer>
        </div>
      </MyProvider>
    );
  }
}