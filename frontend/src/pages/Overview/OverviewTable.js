import React from 'react';

import { toAmountString, statusMapping, tsToString } from '../../helper';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { List, ListItem } from 'material-ui/List';
import CommentIcon from 'material-ui/svg-icons/editor/short-text';
import DateIcon from 'material-ui/svg-icons/action/date-range';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import InfoIcon from 'material-ui/svg-icons/content/create';
import ContentAdd from 'material-ui/svg-icons/content/add';
import _ from 'lodash';
import { ACMECorpDarkBlue } from '../../colors';
import strings from '../../localizeStrings'

import { canCreateProject, canViewProjectDetails } from '../../permissions';

const getTableEntries = ({ projects, history }) => {
  return projects.map((project, index) => {
    const { displayName, amount, currency, status, description, thumbnail = "/Thumbnail_0008.jpg", creationUnixTs } = project
    const amountString = toAmountString(amount, currency)
    const mappedStatus = strings.common.status + ': ' + statusMapping(status)
    const imagePath = !_.isEmpty(thumbnail) ? thumbnail : '/amazon_cover.jpg'
    const dateString = tsToString(creationUnixTs)

    return (
      <Card aria-label='project' key={index} style={{ margin: '20px', width: '35%', maxWidth: '300px' }}>
        <Card>
          <CardMedia
            overlay={<CardTitle title={displayName} subtitle={mappedStatus} />}
          >
            <img style={{ height: '250px', width: '250px' }} src={imagePath} alt='projectType' />
          </CardMedia>
        </Card>
        <CardActions style={{ display: 'flex', flexDirection: 'column', height: '20px', alignItems: 'flex-end', marginTop: '-40px' }}>
          <FloatingActionButton
            disabled={!canViewProjectDetails(project.allowedIntents)}
            backgroundColor={ACMECorpDarkBlue}
            onTouchTap={() => history.push('/projects/' + project.id)} >
            <InfoIcon />
          </FloatingActionButton>
        </CardActions>
        <List>
          <ListItem
            disabled={true}
            leftIcon={<CommentIcon />}
            primaryText={description}
            secondaryText={strings.common.comment}
          />
          <ListItem
            disabled={true}
            leftIcon={<AmountIcon />}
            primaryText={amountString}
            secondaryText={strings.common.budget}
          />

          <ListItem
            disabled={true}
            leftIcon={<DateIcon />}
            primaryText={dateString}
            secondaryText={strings.common.created}
          />

        </List>

      </Card >

    );
  });
}


const OverviewTable = (props) => {
  const tableEntries = getTableEntries(props);
  return (
    <div aria-label='projects' style={{ backgroundColor: 'transparent', height: '100%', width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {tableEntries}
      <Card style={{ margin: '20px', width: '25%', opacity: '0.7' }}>
        <div style={{ display: 'flex', height: '450px', backgroundColor: 'lightgray', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
          <CardActions >
            <FloatingActionButton aria-label='create' disabled={!canCreateProject(props.allowedIntents)} onTouchTap={() => props.showProjectDialog()} style={{ height: '100%', opacity: '1.0' }} >
              <ContentAdd />
            </FloatingActionButton>
          </CardActions>
        </div>
      </Card>
    </div>
  )
}

export default OverviewTable;
