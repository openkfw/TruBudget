import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import strings from "../../localizeStrings";

import JsonEditor from "./JsonEditor";

const AdditionalInfo = ({ resources, idForInfo, isAdditionalDataShown, hideAdditionalData, submitAdditionalData }) => {
  const [additionalDateChange, setAdditionalDateChange] = useState(
    resources.find((item) => item.data.id === idForInfo)?.data?.additionalData || {}
  );
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    setAdditionalDateChange(resources.find((item) => item.data.id === idForInfo)?.data?.additionalData || {});
  }, [idForInfo, resources]);

  return (
    <Dialog disableRestoreFocus open={isAdditionalDataShown} onClose={hideAdditionalData}>
      <DialogTitle>{strings.common.additional_data}</DialogTitle>
      <DialogContent sx={{ maxWidth: "50rem" }}>
        <div>
          <JsonEditor
            data={additionalDateChange}
            onChange={(x) => {
              setAdditionalDateChange(x);
              setDisabled(false);
            }}
          />
        </div>
        {additionalDateChange === undefined && <div>{strings.common.no_resources}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={hideAdditionalData}>{strings.common.close}</Button>
        <Button
          onClick={() => {
            submitAdditionalData(additionalDateChange);
            hideAdditionalData();
          }}
          disabled={isDisabled}
          data-test={`project-additional-data-submit`}
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalInfo;
