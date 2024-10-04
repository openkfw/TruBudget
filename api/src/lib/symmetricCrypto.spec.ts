import { expect } from "chai";

import * as SUT from "./symmetricCrypto";

describe("Symmetric Crypto", () => {
  it("can encrypt & decrypt data", () => {
    const plaintextOriginal = "my little secret";
    const secret = "supersecret";

    const ciphertext = SUT.encrypt(secret, plaintextOriginal);

    expect(ciphertext).to.be.a("string");
    expect(ciphertext).to.not.equal(plaintextOriginal);

    const plaintextAgain = SUT.decrypt(secret, ciphertext);

    expect(plaintextAgain).to.equal(plaintextOriginal);
  });

  it("fails to decrypt when using the wrong secret", () => {
    const encodedEncrypted =
      "2ba6a3a892b89f4422db9f7a39b1279b7db7c93144dd7e58946dc59aec21d22168c0255db6921f7b0c0ffb7213a095eb4bfbb670eb";

    expect(SUT.decrypt("wrong secret", encodedEncrypted)).to.be.instanceOf(Error);
  });
});
