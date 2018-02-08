import React from 'react'
import _ from 'lodash'
import Subheader from 'material-ui/Subheader';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import NotFilledStar from 'material-ui/svg-icons/toggle/star-border';
import FilledStar from 'material-ui/svg-icons/toggle/star';


const styles = {
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
  gridTile: {
    width: '100%',
    height: '100%'
  },
  subHeader: {
    paddingLeft: '0px'
  }
}

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

const ImageSelector = ({ onTouchTap, selectedImage }) => {
  return (
    <div style={styles.root}>
      <Subheader style={styles.subHeader}>Thumbnail</Subheader>
      <GridList
        cellHeight={100}
        style={styles.gridList}
      >
        {images.map((image) => (
          <GridTile
            onTouchTap={() => onTouchTap(image.src)}
            key={image.src}
            style={styles.gridTile}
            title=' ' // Otherwise the action buttons would not be visible
            actionIcon={<IconButton> {
              selectedImage === image.src ?
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
  )
}
export default ImageSelector
