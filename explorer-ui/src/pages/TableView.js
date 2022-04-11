import Head from "next/head";
import { Box, Container, Grid } from "@mui/material";
import * as React from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { DataTable } from "../components/transaction/DataTable";
import { DataTree } from "../components/transaction/DataTree";
import { JsonTree } from "../components/transaction/JsonTree";
import { ListView } from "../components/transaction/ListView";
import { StreamSelect } from "../components/transaction/StreamSelect";

const TableView = () => {
  const [selectedStream, setSelectedStream] = React.useState("");
  return (
    <>
      <Head>
        <title>JsonView</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <StreamSelect
                selectedStream={selectedStream}
                setSelectedStream={setSelectedStream}
              />
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <DataTable selectedStream={selectedStream} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

TableView.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default TableView;
