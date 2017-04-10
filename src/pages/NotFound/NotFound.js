import React from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';

const NotFound = () => (
  <Card style={{
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100

  }}>
    <CardText style={{
      textAlign: 'center'
    }}>
      <h4>404 - Sorry, I couldn't find the page you requested</h4>
      <br/>
      <img src="404.gif"/>
    </CardText>
  </Card>
)

export default NotFound;