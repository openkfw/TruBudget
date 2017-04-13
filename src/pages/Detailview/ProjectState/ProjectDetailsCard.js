import React from 'react';
import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import LinearProgress from 'material-ui/LinearProgress';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';

const styles = {

};

const tilesData = [
  {
    img: 'images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
  },
  {
    img: 'images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    img: 'images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    img: 'images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
  },

];

const ProjectDetailsCard = () => (
      <Card style={{
        width: '74%',
        left: '13%',
        right: '13%',
        top: '100px',
        position: 'absolute',
        zIndex: 1100,

      }}>
      <CardHeader
       title="Project: School"
       subtitle="Status: Ongoing"
       actAsExpander={true}
       showExpandableButton={true}
     >
      <LinearProgress style={{
        width: '20%',
        right: '5%',
        position: 'absolute',
        zIndex: 1100,

      }}
      mode="determinate" value='30' />
     </CardHeader>

     <CardText expandable={true}>
     <GridList
      cellHeight={50}
      style={{
        width: '100%',
        overflowY: 'auto',
      }}
    >
      {tilesData.map((tile) => (
        <GridTile

          title={'Value'}
        >

        </GridTile>
      ))}
    </GridList>
     </CardText>
   </Card>

);

export default ProjectDetailsCard;
