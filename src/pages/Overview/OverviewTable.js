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
import { ACMECorpDarkBlue } from '../../colors';
import strings from '../../localizeStrings'

const getTableEntries = ({ projects, history }) => {
  return projects.map((project, index) => {
    const amount = toAmountString(project.details.amount, project.details.currency)
    const status = strings.common.status + ': ' + statusMapping(project.details.status)
    const comment = project.details.comment
    const imagePath = project.details.name === 'School1' ? './school.jpg' : './amazon_cover.jpg'
    const dateString = tsToString(project.details.createTS)
    return (
      <Card aria-label='project' key={index} style={{ margin: '20px', width: '35%', maxWidth: '300px' }}>
        <Card>
          <CardMedia
            overlay={<CardTitle title={project.details.name} subtitle={status} />}
          >
            <img src={imagePath} alt='projectType' />
          </CardMedia>
        </Card>
        <CardActions style={{ display: 'flex', flexDirection: 'column', height: '20px', alignItems: 'flex-end', marginTop: '-40px' }}>
          <FloatingActionButton backgroundColor={ACMECorpDarkBlue} onTouchTap={() => history.push('/projects/' + project.name)} >
            <InfoIcon />
          </FloatingActionButton>
        </CardActions>
        <List>
          <ListItem
            disabled={true}
            leftIcon={<CommentIcon />}
            primaryText={comment}
            secondaryText={strings.common.comment}
          />
          <ListItem
            disabled={true}
            leftIcon={<AmountIcon />}
            primaryText={amount}
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
            <FloatingActionButton aria-label='create' disabled={!props.loggedInUser.role.admin || !props.loggedInUser.role.write} onTouchTap={props.showWorkflowDialog} style={{ height: '100%', opacity: '1.0' }} >
              <ContentAdd />
            </FloatingActionButton>
          </CardActions>
        </div>
      </Card>
    </div>
  )
}

export default OverviewTable;
