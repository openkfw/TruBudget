export async function checkReadyness(axios): Promise<string> {
  const readiness = await axios.get("/readiness");
  console.log(readiness.data);
  return readiness.data;
}

export async function authenticate(axios): Promise<string> {
  const response = await axios.post("/user.authenticate", {
    user: {
      id: "root",
      password: "asdf",
    },
  });
  const token = response.data.data.user.token;
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
}

export async function getProjects(axios): Promise<any[]> {
  await authenticate(axios);
  const response = await axios.get("/project.list");
  const projectList: any[] = response.data.data.items;
  return projectList;
}

export async function getSubprojects(axios, projectId): Promise<any[]> {
  await authenticate(axios);
  const response = await axios.get(`/subproject.list?projectId=${projectId}`);
  const subprojectList: any[] = response.data.data.items;
  return subprojectList;
}

export async function getWorkflowitems(axios, projectId, subprojectId): Promise<any[]> {
  await authenticate(axios);
  const response = await axios.get(
    `/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`,
  );
  const workflowitemList: any[] = response.data.data.workflowitems;
  return workflowitemList;
}
