import React, { useEffect, useState } from "react";
import Joyride, { EVENTS } from "react-joyride";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdsClickIcon from "@mui/icons-material/AdsClick";
import CloseIcon from "@mui/icons-material/Close";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import InfoIcon from "@mui/icons-material/Info";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Button, IconButton, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";

import { useTourAppContext } from "../../context/tour";
import strings from "../../localizeStrings";

import "./TourWrapper.scss";

function CustomTooltip({ backProps, closeProps, continuous, index, skipProps, primaryProps, step, tooltipProps }) {
  const navigate = useNavigate();

  const { setState } = useTourAppContext();

  const [chapterListVisible, setChapterListVisible] = useState(false);

  const toggleChapterList = () => {
    setChapterListVisible(!chapterListVisible);
    return false;
  };

  const goTo = (chapter) => {
    setState({ stepIndex: chapter.stepIndex - 1, goToStepCheck: true });

    // change url using react router
    navigate(chapter.navigateTo);
  };
  return (
    <div className="tooltip__body" {...tooltipProps}>
      <IconButton aria-label="close" className="tooltip__close" {...closeProps}>
        <CloseIcon />
      </IconButton>
      <div className="tooltip__content_wrapper">
        <div className="tooltip__typeIcon">
          {index === 0 ? (
            <PlayCircleFilledIcon sx={{ color: "#ccc", fontSize: 80 }} />
          ) : step.spotlightClicks ? (
            <>
              <AdsClickIcon sx={{ fontSize: 80 }} />
              <p>{strings.tour.clickTry}</p>
            </>
          ) : (
            <InfoIcon sx={{ color: "#ccc", fontSize: 80 }} />
          )}
        </div>
        <div className="tooltip__text">
          {step.title && <h4 className="tooltip__title">{step.title}</h4>}
          <div className="tooltip__content">{step.content}</div>
          {step.spotlightClicks && (
            <div className="tooltip__clickInfo">
              <FormatQuoteIcon className="tooltip__clickInfo__icon" />
              <span>{step.spotlightClicksHint || strings.tour.clickOnArea}</span>
            </div>
          )}
        </div>
        <div className="tooltip__navigationLink">
          <Button variant="text" onClick={toggleChapterList}>
            {chapterListVisible ? strings.tour.hideChapters : strings.tour.showChapters}
          </Button>
        </div>
        <div className="tooltip__contentList" style={{ display: chapterListVisible ? "" : "none" }}>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                <strong>{strings.tour.chaptersHeading}</strong>
              </ListSubheader>
            }
          >
            {step?.chapterList?.map((chapter, index) => (
              <ListItemButton key={chapter.title} onClick={() => goTo(chapter)}>
                <ListItemIcon>{index + 1}.</ListItemIcon>
                <ListItemText primary={chapter.title} />
              </ListItemButton>
            ))}
          </List>
        </div>
        <div className="tooltip__footer">
          <div className="tooltip__spacer">
            {index > 0 && (
              <Button className="tooltip__button" {...backProps}>
                {strings.tour.back}
              </Button>
            )}
            {continuous && step?.hideNextButton !== true ? (
              <Button className="tooltip__button tooltip__button--primary" variant="contained" {...primaryProps}>
                {index === 0 ? strings.common.tourStart : strings.tour.next}
              </Button>
            ) : (
              <Button className="tooltip__button tooltip__button--primary" variant="text" {...primaryProps}>
                {strings.tour.skip}
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

const initialState = ({ firstProjectId, firstSubprojectId }) => {
  const beforeStart = [
    {
      navigateTo: "/projects"
    }
  ];
  const steps = [
    {
      target: "body",
      content: strings.tour.steps.welcome,
      disableBeacon: true
    },
    {
      target: "[data-test*=sidebarmenu-items-main-group]",
      content: strings.tour.steps.menu,
      disableBeacon: true,
      disableOverlayClose: true,
      chapter: { title: strings.tour.mainMenu, navigateTo: "/projects" }
    },
    {
      target: "[data-test*=sidenav-drawer-backdrop]",
      content: strings.tour.steps.menuClose,
      disableBeacon: true,
      spotlightClicks: true,
      spotlightClicksHint: strings.tour.menuCloseHint,
      hideNextButton: true,
      disableOverlayClose: true,
      disableOverlay: true,
      goToNextStepIf: { elementNotVisible: "[role*=presentation]" }
    },
    {
      target: "#card-table-view-switch",
      content: strings.tour.steps.tableView,
      disableBeacon: true,
      chapter: { title: strings.tour.projectsView, navigateTo: "/projects" },
      backAction: { click: "[data-test*=openSideNavbar]", ifNotVisible: "[data-test*=sidenav-drawer-backdrop]" }
    },
    {
      target: "[data-test*=add-project-button]",
      content: strings.tour.steps.addProject,
      disableBeacon: true,
      backAction: { click: "[data-test*=set-table-view]" }
    },
    {
      target: `[data-test*=project-card-${firstProjectId}]`,
      content: strings.tour.steps.projectCard,
      disableBeacon: true
    },
    {
      target: "[data-test*=project-view-button-0]",
      content: strings.tour.steps.projectDetailsButton,
      disableBeacon: true,
      spotlightClicks: true,
      hideNextButton: true,
      disableOverlayClose: true,
      goToNextStepIf: { url: `/projects/${firstProjectId}` }
    },
    {
      target: ".main-container",
      content: strings.tour.steps.projectDetails,
      chapter: { title: strings.tour.projectDetail, navigateTo: `/projects/${firstProjectId}` }
    },
    {
      target: ".project-details-container",
      content: strings.tour.steps.projectSummary
    },
    {
      target: "[data-test*=sub-projects]",
      content: strings.tour.steps.subProjects
    },
    {
      target: "[data-test*=project-projected-budget]",
      content: strings.tour.steps.projectBudget,
      disableBeacon: true
    },
    {
      target: "[data-test*=single-select-container]",
      content: strings.tour.steps.projectOwner
    },
    {
      target: "[data-test*=project-overal-status]",
      content: strings.tour.steps.projectStatus
    },
    {
      target: "[data-testid*=subproject-0]",
      content: strings.tour.steps.subprojectRow
    },
    {
      target: "[data-test*=subproject-view-status-0]",
      content: strings.tour.steps.subprojectStatus
    },
    {
      target: "[data-test*=subproject-view-details-0]",
      content: strings.tour.steps.subprojectDetails,
      disableBeacon: true,
      spotlightClicks: true,
      hideNextButton: true,
      disableOverlayClose: true,
      goToNextStepIf: { url: `/projects/${firstProjectId}/${firstSubprojectId}` }
    },
    {
      target: "[data-test*=subproject-projected-budget]",
      content: strings.tour.steps.subprojectBudget,
      disableBeacon: true
    },
    {
      target: "[data-testid*=workflowitem-container-0]",
      content: strings.tour.steps.workflowActionRow
    },
    {
      target: "[data-testid*=workflowitem-status-0]",
      content: strings.tour.steps.workflowActionStatus
    },
    {
      target: ".bulk-actions",
      content: strings.tour.steps.bulkActions
    }
  ];

  const chapterList = steps
    .map((step, index) => ({ ...step, stepIndex: index }))
    .filter((step) => step.chapter)
    .map((step) => ({ ...step.chapter, stepIndex: step.stepIndex }));
  const stepsWithChapterList = steps.map((step) => ({ ...step, chapterList }));

  return {
    beforeStart,
    steps: stepsWithChapterList
  };
};

export default function TourWrapper() {
  const firstProjectId = useSelector((state) => state.getIn(["overview", "projects", 0, "data", "id"]));
  const firstSubprojectId = useSelector((state) => state.getIn(["detailview", "subProjects", 0, "data", "id"]));

  const {
    setState,
    state: { run, stepIndex, steps, goToStepCheck }
  } = useTourAppContext();

  const [helpers, setHelpers] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    setState(initialState({ firstProjectId, firstSubprojectId }));
  }, [firstProjectId, firstSubprojectId, setState]);

  const handleCallback = (data) => {
    const { action, index, lifecycle, type } = data;

    if (action === "close") {
      setState({ run: false, tourActive: false });
      return;
    } else if (type === "step:after" && action === "next") {
      if (steps[index]?.spotlightClicks) {
        const clickElement = steps[index].target;
        if (clickElement) {
          document.querySelector(clickElement)?.click();
        }
        return;
      }

      if (goToStepCheck) {
        setState({ goToStepCheck: false });
      } else {
        setState({ stepIndex: index + 1 });
      }

      if (steps[index]?.navigateTo) {
        navigate(steps[index]?.navigateTo);
      }
    } else if (type === "step:after" && action === "prev") {
      let backAction = () => {};
      // navigate to previous url
      if (steps[index - 1]?.navigateTo) {
        const prevUrl = findClosestUrl(steps, index - 2) || "/";

        navigate(prevUrl);
      } else if (steps[index - 1]?.goToNextStepIf?.url) {
        const prevUrl = findClosestUrl(steps, index - 2) || "/";

        navigate(prevUrl);
      } else if (steps[index]?.backAction) {
        const { click, ifNotVisible } = steps[index].backAction;

        if (click && (!ifNotVisible || !document.querySelector(ifNotVisible))) {
          backAction = () => document.querySelector(click)?.click();
        }
      }

      const { skipBackStepsAmount } = steps[index].backAction || {};
      const newIndex = skipBackStepsAmount ? index - skipBackStepsAmount - 1 : index - 1;

      setTimeout(() => {
        setState({ stepIndex: newIndex });
        backAction();
      }, 200);
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      // TODO resolve when target not found in the future
    } else if (action === "reset" || lifecycle === "complete") {
      setState({ run: false, stepIndex: 0, tourActive: false });
    }
  };

  const getHelpers = (helpers) => {
    setHelpers(helpers);
  };

  // Wrapper component to inject helpers into CustomTooltip
  const WrappedTooltip = (props) => {
    return <CustomTooltip {...props} helpers={helpers} />;
  };

  return (
    <Joyride
      callback={handleCallback}
      tooltipComponent={WrappedTooltip}
      getHelpers={getHelpers}
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
