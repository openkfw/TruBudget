import React, { useEffect } from "react";
import Joyride, { ACTIONS, EVENTS } from "react-joyride";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import CloseIcon from "@mui/icons-material/Close";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { Button, IconButton } from "@mui/material";

import { useTourAppContext } from "../../context/tour";

import "./TourWrapper.scss";

function CustomTooltip(props) {
  const { backProps, closeProps, continuous, index, primaryProps, step, tooltipProps } = props;

  return (
    <div className="tooltip__body" {...tooltipProps}>
      <IconButton aria-label="close" className="tooltip__close" {...closeProps}>
        <CloseIcon />
      </IconButton>
      <div className="tooltip__content_wrapper">
        {step.title && <h4 className="tooltip__title">{step.title}</h4>}
        <div className="tooltip__content">{step.content}</div>
        {step.spotlightClicks && (
          <div className="tooltip__clickInfo">
            <FormatQuoteIcon className="tooltip__clickInfo__icon" />
            <span>{step.spotlightClicksHint || "Click on highlighted area to continue."}</span>
          </div>
        )}
        <div className="tooltip__footer">
          {/* <button className="tooltip__button" {...skipProps}>
          {skipProps.title}
        </button> */}
          <div className="tooltip__spacer">
            {index > 0 && (
              <Button className="tooltip__button" {...backProps}>
                {backProps.title}
              </Button>
            )}
            {continuous && step?.hideNextButton !== true && (
              <Button className="tooltip__button tooltip__button--primary" variant="contained" {...primaryProps}>
                {primaryProps.title}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function findClosestUrl(array, startIndex) {
  // Check if the array is valid and the startIndex is within bounds
  if (!Array.isArray(array) || startIndex < 0 || startIndex >= array.length) {
    return null;
  }

  // Iterate backward from the given index
  for (let i = startIndex - 1; i >= 0; i--) {
    // eslint-disable-next-line no-prototype-builtins
    if (array[i].hasOwnProperty("navigateTo")) {
      return array[i].navigateTo;
      // eslint-disable-next-line no-prototype-builtins
    } else if (array[i].hasOwnProperty("goToNextStepIf") && array[i].goToNextStepIf.hasOwnProperty("url")) {
      return array[i].goToNextStepIf.url;
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
      beforeStart: [
        {
          navigateTo: "/projects"
        }
      ],
      steps: [
        {
          target: "[data-test*=sidebarmenu-items-main-group]",
          content: "You can use main menu to navigate TruBudget application.",
          disableBeacon: true,
          disableOverlayClose: true
        },
        {
          target: "[data-test*=sidenav-drawer-backdrop]",
          content: "Let's start with list of projects. Click anywhere away from menu.",
          disableBeacon: true,
          spotlightClicks: true,
          spotlightClicksHint: "Click anywhere away from menu to close the main menu.",
          hideNextButton: true,
          disableOverlayClose: true,
          disableOverlay: true,
          goToNextStepIf: { elementNotVisible: "[role*=presentation]" }
        },
        {
          target: "#card-table-view-switch",
          content: "You can switch view of your projects between card and table view.",
          disableBeacon: true,
          hideNextButton: true,
          spotlightClicks: true,
          goToNextStepIf: { elementNotVisible: "[data-test*=set-table-view]" },
          backAction: { click: "[data-test*=openSideNavbar]", skipBackStepsAmount: 1 }
        },
        {
          target: "#card-table-view-switch",
          content: "Click again to switch back to card view.",
          disableBeacon: true,
          hideNextButton: true,
          spotlightClicks: true,
          goToNextStepIf: { elementNotVisible: "[data-test*=set-card-view]" }
        },
        {
          target: "[data-test*=add-project-button]",
          content: "Here you can add more projects.",
          disableBeacon: true
        },
        {
          target: `[data-test*=project-card-${firstProjectId}]`,
          content: "Here you can see project overview card with project information.",
          disableBeacon: true
        },
        {
          target: "[data-test*=project-view-button-0]",
          content: "Here you can display project details. Click on the button to see project details.",
          disableBeacon: true,
          spotlightClicks: true,
          hideNextButton: true,
          disableOverlayClose: true,
          goToNextStepIf: { url: `/projects/${firstProjectId}` }
        },
        {
          target: ".main-container",
          content: "This is project details page."
        },
        {
          target: ".project-details-container",
          content: "Here you can see project summary."
        },
        {
          target: "[data-test*=sub-projects]",
          content: "And here is the list of all subprojects of this project."
        },
        {
          target: "[data-test*=project-projected-budget]",
          content: "You can see overal budget.",
          disableBeacon: true
        },
        {
          target: "[data-test*=single-select-container]",
          content: "Here you can view the responsible person for this project."
        },
        {
          target: "[data-test*=project-overal-status]",
          content: "Here you can see project overal status."
        },
        {
          target: "[data-testid*=subproject-0]",
          content: "Here you can see individual subproject rows."
        },
        {
          target: "[data-test*=subproject-view-status-0]",
          content: "Individual subprojects might have different status."
        },
        {
          target: "[data-test*=subproject-view-details-0]",
          content: "Here you can display subproject details.",
          disableBeacon: true,
          spotlightClicks: true,
          hideNextButton: true,
          disableOverlayClose: true,
          goToNextStepIf: { url: `/projects/${firstProjectId}/${firstSubprojectId}` }
        },
        {
          target: "[data-test*=subproject-projected-budget]",
          content: "Subproject budget.",
          disableBeacon: true
        },
        {
          target: "[data-testid*=workflowitem-container-0]",
          content: "Each row is an individual workflow action."
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
      // navigate to previous url
      if (steps[index - 1]?.navigateTo) {
        const prevUrl = findClosestUrl(steps, index - 2) || "/";

        navigate(prevUrl);
      } else if (steps[index - 1]?.goToNextStepIf?.url) {
        const prevUrl = findClosestUrl(steps, index - 2) || "/";

        navigate(prevUrl);
      } else if (steps[index]?.backAction) {
        const { click } = steps[index].backAction;

        if (click) {
          document.querySelector(click)?.click();
        }
      }

      const { skipBackStepsAmount } = steps[index].backAction || {};
      const newIndex = skipBackStepsAmount ? index - skipBackStepsAmount - 1 : index - 1;
      console.log("newIndex", newIndex, steps[index].backAction);

      // setState((prevState) => ({ ...prevState, stepIndex: newIndex }));
      setTimeout(() => setState({ stepIndex: newIndex }), 200);
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    } else if (action === "reset" || lifecycle === "complete") {
      setState({ run: false, stepIndex: 0, tourActive: false });
    }
  };

  return (
    <Joyride
      callback={handleCallback}
      tooltipComponent={CustomTooltip}
      continuous
      styles={{
        options: {
          arrowColor: "#e3ffeb",
          backgroundColor: "#fefefe",
          primaryColor: "rgb(63, 81, 181, 1)",
          textColor: "#rgb(255, 255, 255, 1)",
          width: 900,
          zIndex: 1300
        }
      }}
      run={run}
      disableBeacon={true}
      disableOverlayClose={true}
      stepIndex={stepIndex}
      steps={steps}
    />
  );
}
