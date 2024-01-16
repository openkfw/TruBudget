import React, { useEffect } from "react";
import Joyride from "react-joyride";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useTourAppContext } from "../../context/tour";

function findClosestObjectWithUrl(array, startIndex) {
  // Check if the array is valid and the startIndex is within bounds
  if (!Array.isArray(array) || startIndex < 0 || startIndex >= array.length) {
    return null;
  }

  // Iterate backward from the given index
  for (let i = startIndex - 1; i >= 0; i--) {
    // eslint-disable-next-line no-prototype-builtins
    if (array[i].hasOwnProperty("navigateTo")) {
      return array[i];
    }
  }

  // If no object with "url" attribute is found, return null
  return null;
}

export default function TourWrapper() {
  const firstProjectId = useSelector((state) => state.getIn(["overview", "projects", 0, "data", "id"]));
  const firstSubprojectId = useSelector((state) => state.getIn(["detailview", "subProjects", 0, "data", "id"]));

  const {
    setState,
    state: { run, stepIndex, steps }
  } = useTourAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    setState({
      steps: [
        {
          target: "[data-test*=set-table-view]",
          content: "You can switch view of your projects between card and table view.",
          disableBeacon: true
        },
        {
          target: `[data-test*=project-card-${firstProjectId}]`,
          content: "Here you can see project overview card with project information.",
          disableBeacon: true
        },
        {
          target: "[data-test*=project-view-button-0]",
          content: "Here you can display project details.",
          disableBeacon: true,
          navigateTo: `/projects/${firstProjectId}`
        },
        {
          target: "[data-test*=project-projected-budget]",
          content: "You can see overal budget.",
          disableBeacon: true
        },
        {
          target: "[data-test*=subproject-view-details-0]",
          content: "Here you can display subproject details.",
          disableBeacon: true,
          navigateTo: `/projects/${firstProjectId}/${firstSubprojectId}`
        },
        {
          target: "[data-test*=subproject-projected-budget]",
          content: "Subproject budget.",
          disableBeacon: true
        }
      ]
    });
  }, [firstProjectId, firstSubprojectId, setState]);

  const handleCallback = (data) => {
    const { action, index, lifecycle, type } = data;

    if (action === "close") {
      setState({ run: false, tourActive: false });
    } else if (type === "step:after" && action === "next") {
      setState({ stepIndex: index + 1 });

      if (steps[index]?.navigateTo) {
        navigate(steps[index]?.navigateTo);
      }
    } else if (type === "step:after" && action === "prev") {
      setState({ stepIndex: index - 1 });

      // navigate to previous url
      if (steps[index - 1]?.navigateTo) {
        const prevUrl = findClosestObjectWithUrl(steps, index - 2)?.navigateTo || "/";

        navigate(prevUrl);
      }
    } else if (action === "reset" || lifecycle === "complete") {
      setState({ run: false, stepIndex: 0, tourActive: false });
    }
  };

  return <Joyride callback={handleCallback} continuous run={run} stepIndex={stepIndex} steps={steps} />;
}
