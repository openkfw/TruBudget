import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import LinearProgress from 'material-ui/LinearProgress';
import { GridList, GridTile } from 'material-ui/GridList';

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

const ProjectState = (props) => (
  <Card style={{
    width: '74%',
    left: '13%',
    right: '13%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardHeader
      title={props.location.pathname.split('/')[2]}
      subtitle="Status: Ongoing"
      actAsExpander={true}
      showExpandableButton={true}
    >
      <LinearProgress style={{
        width: '20%',
        right: '5%',
        position: 'absolute',
      }}
        mode="determinate" value={30} />
    </CardHeader>

    <CardText expandable={true}>
      <GridList
        cellHeight={50}
        style={{
          width: '100%',
          overflowY: 'auto',
        }}
      >
        {tilesData.map((tile, index) => (
          <GridTile
            key={index + 'tile'}
            title={'Value'}
          />
        ))}
      </GridList>
    </CardText>
  </Card>

);

export default ProjectState;
