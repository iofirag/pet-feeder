import React from 'react';
import './Home.scss';
import { AppContext } from './App';
import HttpService from './HttpService';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';


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

  parseDate = (ts: number) => {
    const d = new Date(ts)
    const date = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const seconds = d.getSeconds();
    const dateTimeStr = date + "/" + month + "/" + year + ' '+ hour + ':' + minute + ':' + seconds;
    return dateTimeStr
  }

  renderRow = (props: ListChildComponentProps) => {
    const { index, style } = props;
    return (
      <ListItem button style={style} key={index}>
        <ListItemText primary={`Item ${index + 1}`} />
      </ListItem>
    );
  }

  render() {
    const tsHeadList = this.context.state.settings.lastFeedTsList.slice(-10).reverse()
    const tsElementList = (
      <Grid item xs={5} md={4} lg={2} className='ts-grid'>
        <Typography variant="h6" >
          Feed history:
        </Typography>
        <div className='list-wrapper'>
          <List dense={false} >
            { tsHeadList.map((ts: number) => {
              return (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={this.parseDate(ts)}
                    secondary={false ? 'Secondary text' : null}
                  />
                </ListItem>
              )
            })}
          </List >
        </div>
      </Grid>
    )

    return (
      <div className="Home">
        <AppContext.Consumer>
          {(context: any) => (
            <React.Fragment>
              <main>

                <button
                  className="manual-feed-bt"
                  onClick={() => this.manualFeed(context)}
                  style={{ backgroundImage: `url(${context.state.settings.petPictureUrl})` }}
                >
                  Manual Feed
                </button>
                <br />
                {tsElementList}
              </main>
            </React.Fragment>
          )}
        </AppContext.Consumer>
      </div>
    );
  }
}