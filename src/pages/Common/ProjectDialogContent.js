import React from 'react';
import ProjectCreationName from '../Overview/ProjectCreationName';
import ProjectCreationAmount from '../Overview/ProjectCreationAmount';
import ProjectCreationComment from '../Overview/ProjectCreationComment';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import strings from '../../localizeStrings'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import _ from 'lodash'
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import NotFilledStar from 'material-ui/svg-icons/toggle/star-border';
import FilledStar from 'material-ui/svg-icons/toggle/star';



const images = [
  {
    src: '/Thumbnail_0001.jpg',
  },
  {
    src: '/Thumbnail_0002.jpg',
  },
  {
    src: '/Thumbnail_0003.jpg',
  },
  {
    src: '/Thumbnail_0004.jpg',
  },
  {
    src: '/Thumbnail_0005.jpg',
  },
  {
    src: '/Thumbnail_0006.jpg',
  },
  {
    src: '/Thumbnail_0007.jpg',
  },
  {
    src: '/Thumbnail_0008.jpg',
  },
  {
    src: '/Thumbnail_0009.jpg',
  },
  {
    src: '/Thumbnail_0010.jpg',
  },
  {
    src: '/Thumbnail_0011.jpg',
  },
  {
    src: '/Thumbnail_0012.jpg',
  },
  {
    src: '/Thumbnail_0013.jpg',
  },
  {
    src: '/Thumbnail_0014.jpg',
  },
  {
    src: '/Thumbnail_0015.jpg',
  },
  {
    src: '/Thumbnail_0016.jpg',
  },
  {
    src: '/Thumbnail_0017.jpg',
  },
  {
    src: '/Thumbnail_0018.jpg',
  },
  {
    src: '/Thumbnail_0019.jpg',
  },
  {
    src: '/Thumbnail_0020.jpg',
  },
  {
    src: '/Thumbnail_0021.jpg',
  },
  {
    src: '/Thumbnail_0022.jpg',
  },
  {
    src: '/Thumbnail_0023.jpg',
  },
  {
    src: '/Thumbnail_0024.jpg',
  },

];


const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  divider: {
    width: '100%'
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  gridList: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',

  },
}

const ProjectDialogContent = (props) => {
  const floatingLabelText = strings.project.project_title
  const hintText = strings.project.project_title_description
  var commentFloat = strings.project.project_comment
  const commentHint = strings.common.comment_description
  let amountHint = strings.project.project_budget_amount;
  let amountLabel = strings.project.project_budget_amount_description;
  const parentCurrency = props.parentCurrency
  let usdDisabled;
  let eurDisabled;
  let brlDisabled;
  if (_.isUndefined(parentCurrency)) {
    usdDisabled = false;
    eurDisabled = false;
    brlDisabled = false;
  } else {
    usdDisabled = !(parentCurrency === 'USD');
    eurDisabled = !(parentCurrency === 'EUR');
    brlDisabled = !(parentCurrency === 'BRL');
  }

  return (
    <div>
      <div style={styles.inputDiv}>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          style={{ width: 180 }}
          value={props.projectName}
          onChange={(event) => props.storeProjectName(event.target.value)}
        />
        <TextField
          aria-label="commentinput"
          multiLine={true}
          style={{ width: 180 }}
          floatingLabelText={commentFloat}
          hintText={commentHint}
          value={props.projectComment}
          onChange={(event) => props.storeProjectComment(event.target.value)}
        />
      </div>
      <Divider />
      <div style={styles.inputDiv}>

        <SelectField style={{
          width: 180
        }}
          floatingLabelText={strings.project.project_currency}
          value={props.projectCurrency}
          onChange={(event, index, value) => props.storeProjectCurrency(value)}
        >
          <MenuItem disabled={eurDisabled} value='EUR' primaryText="EUR" />
          <MenuItem disabled={usdDisabled} value='USD' primaryText="USD" />
          <MenuItem disabled={brlDisabled} value='BRL' primaryText="BRL" />
        </SelectField>
        <TextField
          floatingLabelText={amountLabel}
          hintText={amountLabel}
          style={{ width: 180 }}
          type='number'
          value={props.projectAmount}
          onChange={(event) => props.storeProjectAmount(event.target.value)}
        />
      </div>
      <Divider />
      <div style={styles.root}>
        <Subheader style={{ 'paddingLeft': '0px' }}>Thumbnail</Subheader>
        <GridList
          cellHeight={100}
          style={styles.gridList}
        >

          {images.map((image) => (
            <GridTile
              onTouchTap={() => props.storeProjectThumbnail(image.src)}
              key={image.src}
              style={{ width: '100%', height: '100%' }}
              title=' ' // Otherwise the action buttons would not be visible
              actionIcon={<IconButton> {
                props.projectThumbnail === image.src ?
                  <FilledStar color="white" /> : <NotFilledStar color="white" />
              }</IconButton>}
              actionPosition="right"
              titlePosition="top"
              titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            >
              <img alt={image.src} src={image.src} />
            </GridTile>
          ))
          }
        </GridList >
      </div >
    </div >
  )

}

export default ProjectDialogContent;
