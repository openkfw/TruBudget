async function timeout(ms): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export default timeout;
