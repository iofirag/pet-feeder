import React from 'react';
import './Home.scss';
import { AppContext } from './App';
import HttpService from './HttpService';



export class Home extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  manualFeed = async (context: any) => {
    context.setModalOpen()
    try {
      const httpRes = await HttpService.executeRequest(`${process.env.REACT_APP_PET_FEEDER_REST_ENDPOINT}/manual-feed`)
      if (httpRes.status !== 200) throw 'Error: bad response'
      
      const httpJsonRes = await httpRes.json();
      context.setHttpResponse('success')
      context.updateSettings({lastFeedTsList: [...context.state.settings.lastFeedTsList, (new Date()).getTime()]})
    } catch (error) {
      context.setHttpResponse('fail')
      console.error(error)
    }
  }

  render() {
    return (
      <div className="Home">
        <AppContext.Consumer>
          {(context: any) => (
            <React.Fragment>
              <main>
                <h3>number of feed today: <span>{context.state.settings.lastFeedTsList.length}</span></h3>
                <br />

                <button
                  className="manual-feed-bt"
                  onClick={() => this.manualFeed(context)}
                  style={{ backgroundImage: `url(${context.state.settings.petPictureUrl})` }}
                >
                  Manual Feed
                </button>
              </main>
            </React.Fragment>
          )}
        </AppContext.Consumer>
      </div>
    );
  }
}