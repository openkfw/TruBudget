import { expect } from "chai";
import ProjectModel from ".";
import MultichainClientStub from "../multichain/stub";

const multichainClient = new MultichainClientStub();

describe("Project model", () => {
  it("has a list of projects", async () => {
    const SUT = new ProjectModel(multichainClient);
    const result = await SUT.list();
    switch (result.kind) {
      case "resource list":
        const { intent, resources } = result;
        expect(intent.intent).to.equal("list projects");
        expect(resources.filter(x => x.name === "Project One")).to.have.lengthOf(1);
        break;
      default:
        expect(true).to.be.false;
    }
  });
});
