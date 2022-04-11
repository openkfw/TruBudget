import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import { JsonView } from "./JsonView";
import axios from "axios";
import config from "../../config";

// user vs expert View
export const DataTable = (props) => {
  const { selectedStream = "" } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [streamItems, setStreamItems] = React.useState([]);

  React.useEffect(() => {
    fetchStreamItems();
  }, [selectedStream]);

  React.useEffect(() => {
    console.log(streamItems);
    false &&
      streamItems.map((s) => {
        console.log(s);
      });
  }, [streamItems]);

  async function fetchStreamItems() {
    if (selectedStream === "") {
      return;
    }
    await axios
      .get(
        config.baseUrlToExplorerApi +
          `/stream.getAllStreamItems?name=${selectedStream}`
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setStreamItems(response.data);
        }
      });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <TableContainer sx={{ maxHeight: "3000px" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell
                key={"txid"}
                align={"left"}
                style={{ minWidth: "100px" }}
              >
                TXID
              </TableCell>
              <TableCell
                key={"date"}
                align={"left"}
                style={{ minWidth: "100px" }}
              >
                Date
              </TableCell>
              <TableCell
                key={"data"}
                align={"left"}
                style={{ minWidth: "100px" }}
              >
                Data object
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {streamItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <>
                    <TableRow hover key={row.code}>
                      <TableCell
                        key={"txid-2"}
                        align={"left"}
                        style={{ minWidth: "100px" }}
                      >
                        {row.txid}
                      </TableCell>
                      <TableCell
                        key={"date-2"}
                        align={"left"}
                        style={{ minWidth: "100px" }}
                      >
                        {row.time}
                      </TableCell>
                      <TableCell key={"data-2"} align={"left"}>
                        <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
                          <JsonView data={row.data}></JsonView>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={streamItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
