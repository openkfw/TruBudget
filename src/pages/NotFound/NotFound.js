import React from 'react';
import { Card, CardText } from 'material-ui/Card';

const NotFound = () => (
  <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', marginTop: '50px', }}>
    <Card style={{
      width: '60%',
      position: 'relative',
      zIndex: 1100
    }}>
      <CardText style={{
        textAlign: 'center'
      }}>
        <h4>404 - Sorry, I couldn't find the page you requested</h4>
        <br />
        <img src="/404.gif" alt="I am sorry :(" />
      </CardText>
    </Card>
  </div>
)

export default NotFound;
