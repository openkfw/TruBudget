import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import axios from "axios";

const columns = [
  { id: "txid", label: "TXID", minWidth: 170 },
  { id: "time", label: "Time", minWidth: 100 },
  {
    id: "data",
    label: "Data",
    minWidth: 170,
    align: "right",
    // format: (value) => Json.stringify("value"),
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263),
  createData("China", "CN", 1403500365, 9596961),
  createData("Italy", "IT", 60483973, 301340),
  createData("United States", "US", 327167434, 9833520),
  createData("Canada", "CA", 37602103, 9984670),
  createData("Australia", "AU", 25475400, 7692024),
  createData("Germany", "DE", 83019200, 357578),
  createData("Ireland", "IE", 4857000, 70273),
  createData("Mexico", "MX", 126577691, 1972550),
  createData("Japan", "JP", 126317000, 377973),
  createData("France", "FR", 67022000, 640679),
  createData("United Kingdom", "GB", 67545757, 242495),
  createData("Russia", "RU", 146793744, 17098246),
  createData("Nigeria", "NG", 200962417, 923768),
  createData("Brazil", "BR", 210147125, 8515767),
];

const convertUnixEpochToDate = (epoch) => {
  return new Date(epoch * 1000);
};

const baseUrlToExplorerApi = "http://localhost:8081";

export const DataTable = (props) => {
  const { streamName = "users" } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [streamItems, setStreamItems] = React.useState([]);

  React.useEffect(() => {
    fetchStreamItems();
  }, []);

  React.useEffect(() => {
    console.log(streamItems);
    false &&
      streamItems.map((s) => {
        console.log(s);
      });
  }, [streamItems]);

  async function fetchStreamItems() {
    await axios
      .get(
        baseUrlToExplorerApi + `/stream.getAllStreamItems?name=${streamName}`
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
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* {JSON.stringify(streamItems)} */}
      <TableContainer sx={{ maxHeight: 440 }}>
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
                key={"txid"}
                align={"left"}
                style={{ minWidth: "100px" }}
              >
                Date
              </TableCell>
              <TableCell
                key={"txid"}
                align={"left"}
                style={{ minWidth: "100px" }}
              >
                Data object
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {streamItems
              //   .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
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
                    <TableCell
                      key={"data-2"}
                      align={"left"}
                      style={{ minWidth: "100px" }}
                    >
                      {JSON.stringify(row.data)}
                    </TableCell>
                  </TableRow>
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
