import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import WorkflowItem from './WorkflowItem'

const getSortableItems = ({ workflowItems, permissions, ...props }) => {
  let nextWorkflowNotSelectable = false;

  return workflowItems.map((workflow, index) => {
    const status = workflow.status;
    const currentWorkflowSelectable = !nextWorkflowNotSelectable;
    if (!nextWorkflowNotSelectable) {
      nextWorkflowNotSelectable = status === 'open' || status === 'in_progress' || status === 'in_review'
    }
    return (
      <WorkflowItem disabled={!props.workflowSortEnabled || workflow.status !== 'open'} key={`item-${index}`} index={index} mapIndex={index} workflow={workflow} permissions={permissions}
        currentWorkflowSelectable={currentWorkflowSelectable} {...props} />
    );
  });
}

const WorkflowList = SortableContainer((props) => {
  const sortableItems = getSortableItems(props)
  return (<div style={{ width: '100%', height: '20%', margin: '0 auto', overflow: 'auto', backgroundColor: '#f3f3f3', border: '1px solid #EFEFEF', borderRadius: 3, }}>
    {sortableItems}
  </div>
  )
});

export default WorkflowList;
