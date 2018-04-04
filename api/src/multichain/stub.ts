import { Stream, StreamMetadata, MultichainClient } from "./client";

const metadata = {
  "Project One": {
    creationUnixTs: "0",
    status: "open",
    name: "Project One",
    description: "First example project.",
    amount: "1234.56",
    currency: "EUR",
    thumbnail: "default.jpg"
  }
};

class MultichainClientStub implements MultichainClient {
  async streams(): Promise<Stream[]> {
    return [
      {
        name: "root",
        createtxid: "b0b4193694923b030eadac026a60a547215168e6f5b7dd57246f3ae0290db693",
        streamref: "0-0-0",
        open: true,
        details: {},
        subscribed: true,
        synchronized: true,
        items: 0,
        confirmed: 0,
        keys: 0,
        publishers: 0
      },
      {
        name: "Project One",
        createtxid: "b0923874982747982783479283479247215168e6f5b7dd57246f3ae0290db693",
        streamref: "0-0-0",
        open: true,
        details: { kind: "project" },
        subscribed: true,
        synchronized: true,
        items: 0,
        confirmed: 0,
        keys: 0,
        publishers: 0
      }
    ];
  }
  async metadata(stream: Stream): Promise<StreamMetadata> {
    return metadata[stream.name];
  }
}

export default MultichainClientStub;
