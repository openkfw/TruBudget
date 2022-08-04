import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { isEmptyDeep } from "../../helper";
import React, { useState, useEffect } from "react";
import JsonEditor from "./JsonEditor";
import strings from "../../localizeStrings";

const AdditionalInfo = ({ resources, idForInfo, isAdditionalDataShown, hideAdditionalData, submitAdditionalData }) => {
  const [additionalDateChange, setAdditionalDateChange] = useState(
    resources.find((item) => item.data.id === idForInfo)?.data?.additionalData || {}
  );

  useEffect(() => {
    setAdditionalDateChange(resources.find((item) => item.data.id === idForInfo)?.data?.additionalData || {});
  }, [idForInfo, resources]);

  useEffect(() => {
    console.log("additionalDateChange --- ");
    console.log(additionalDateChange);
  }, [additionalDateChange]);

  return (
    <Dialog disableRestoreFocus open={isAdditionalDataShown} onClose={hideAdditionalData}>
      <DialogTitle>{strings.common.additional_data}</DialogTitle>
      <DialogContent sx={{ maxWidth: "800px" }}>
        <div>
          <JsonEditor data={additionalDateChange} onChange={(x) => setAdditionalDateChange(x)} />
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
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalInfo;
