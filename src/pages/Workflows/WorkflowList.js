import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import WorkflowItem from './WorkflowItem'

const getSortableItems = ({ workflowItems, permissions, ...props }) => {

  return workflowItems.map((workflow, index) => {
    return (
      <WorkflowItem disabled={!props.workflowSortEnabled || workflow.data.status !== 'open'} key={`item-${index}`} index={index} mapIndex={index} workflow={workflow} permissions={permissions} {...props} />
    );
  });
}

const WorkflowList = SortableContainer((props) => {
  const sortableItems = getSortableItems(props)
  return (<div style={{
    width: '100%',
    height: '20%',
    margin: '0 auto',
    overflow: 'auto',
    backgroundColor: '#f3f3f3',
    border: '1px solid #EFEFEF',
    borderRadius: 3,

  }}>
    {sortableItems}
  </div>
  )
});

export default WorkflowList;
