import Head from "next/head";
import { Box, Container, Grid } from "@mui/material";
import * as React from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { DataTable } from "../components/transaction/DataTable";
import { ListView } from "../components/transaction/ListView";
import { StreamSelect } from "../components/transaction/StreamSelect";

const Dashboard = () => {
  const [selectedStream, setSelectedStream] = React.useState("users");
  return (
    <>
      <Head>
        <title>Dashboard</title>
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
              <ListView selectedStream={selectedStream} />
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

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
