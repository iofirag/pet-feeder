import React from 'react';
import './Header.scss';
import { AppContext } from './App';
import HttpService from './HttpService';
import _ from 'lodash';


export class Settings extends React.Component<any, any> {
  uploadChangesDebounced: () => void
  
  constructor(props: any) {
    super(props);
    this.state = {
      isFormDirty: false
    }
    this.uploadChangesDebounced = _.debounce(async () => {
      await this.uploadChanges()
    }, 500);
  }

  handleChange = async (event: any, context: any) => {
    let value = event.currentTarget.value
    if (['turnSeconds','numberOfFeedEveryDay','delayHoursBetweenFeeds'].includes(event.currentTarget.name)) {
      value = parseInt(event.currentTarget.value)
    }
    context.updateSettings(event.currentTarget.name, value)
    this.setState({isFormDirty: true}, this.uploadChangesDebounced)
  }

  uploadChanges = async () => {
    if (!this.state.isFormDirty) return;

    this.props.context.setHttpResponse('')
    try {
      const httpRes = await HttpService.executeRequest(`${process.env.REACT_APP_PET_FEEDER_REST_ENDPOINT}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petName: this.props.context.state.settings.petName,
          petPictureUrl: this.props.context.state.settings.petPictureUrl,
          morningTime: this.props.context.state.settings.morningTime,
          feedTime: this.props.context.state.settings.feedTime,
          turnSeconds: this.props.context.state.settings.turnSeconds,
          numberOfFeedEveryDay: this.props.context.state.settings.numberOfFeedEveryDay,
          delayHoursBetweenFeeds: this.props.context.state.settings.delayHoursBetweenFeeds,
        })
      })
      if (httpRes.status !== 200) throw 'Error: bad response'
      
      const httpJsonRes = await httpRes.json();
      this.props.context.setHttpResponse('success')
      setTimeout(() => {
        this.props.context.setHttpResponse('')
      },5000)
      this.setState({isFormDirty: false})
    } catch (error) {
      this.props.context.setHttpResponse('fail')
      console.error(error)
    }
  }

  render() {
    return (
      <div>
        <AppContext.Consumer>
          {(context: any) => (
            <React.Fragment>
              <form className='Settings' action="#">
                <h3>Settings</h3>
                <div className="form-group">
                  {/* pet name */}
                  <label className="control-label">
                    pet Name:
                    <input value={context.state.settings.petName} onChange={(e) => this.handleChange(e, context)} name="petName" type="text" className="form-control required"/>
                  </label><br/>

                  {/* pet picture url */}
                  <label className="control-label">
                    pet picture url:
                    <input value={context.state.settings.petPictureUrl} onChange={(e) => this.handleChange(e, context)} name="petPictureUrl" type="text" className="form-control required"/>
                  </label><br/>

                  {/* morning time */}
                  <label className="control-label">
                    morning Time:
                    <input value={context.state.settings.morningTime} onChange={(e) => this.handleChange(e, context)} name="morningTime" type="time" className="form-control required"/>
                  </label><br/>

                  {/* pet feed time */}
                  <label className="control-label">
                    feed Time:
                    <input value={context.state.settings.feedTime} onChange={(e) => this.handleChange(e, context)} name="feedTime" type="time" className="form-control required"/>
                  </label><br/>

                  {/* machine turn seconds */}
                  <label className="control-label">
                    machine turn seconds:
                    <input value={context.state.settings.turnSeconds} onChange={(e) => this.handleChange(e, context)} name="turnSeconds" type="number" className="form-control required"/>
                  </label><br/><br/>

                  {/* number of feed every day */}
                  <label className="control-label">
                    number of feed every day:
                    <input value={context.state.settings.numberOfFeedEveryDay} onChange={(e) => this.handleChange(e, context)} name="numberOfFeedEveryDay" type="number" className="form-control required"/>
                  </label><br/><br/>

                  {/* delay hours between feeds */}
                  <label className="control-label">
                    delay hours between feeds:
                    <input value={context.state.settings.delayHoursBetweenFeeds} onChange={(e) => this.handleChange(e, context)} name="delayHoursBetweenFeeds" type="number" className="form-control required"/>
                  </label><br/><br/>
                </div>
                {
                  context.state.client.httpResponse === 'success' ?
                  <div className="footer">
                    <div className="btn btn-primary">{context.state.client.httpResponse==='success'?'Saved':context.state.client.httpResponse==='fail'?'Error': ''}</div>
                  </div> : null
                }
              </form>
            </React.Fragment>
          )}
        </AppContext.Consumer>

      </div>
    );
  }
}